# Preventing Full Page Refreshes with Comment Updates

## The Problem

In Next.js applications, particularly those using the App Router, a common issue is that user interactions like posting comments trigger full page refreshes. This happens when using `router.refresh()` to update server components with new data.

For example, our recipe page was refreshing entirely when a user posted a comment:

```typescript
// Previous problematic implementation
const onCreateComment = useCallback(
    (comment: string) => {
        axios.post('/api/comments', {...})
            .then(() => {
                // This causes a full page refresh
                router.refresh();
            })
    },
    [router]
);
```

This approach had significant drawbacks:
- Poor user experience with visible page flashes
- Lost scroll position
- Unnecessary re-rendering of all components
- Wasted bandwidth re-fetching assets

## The Solution: Local State Management

We implemented a solution that uses React's state management to update only the comments component when changes occur, avoiding full page refreshes.

### Core Implementation

```typescript
// Local state for comments
const [comments, setComments] = useState<SafeComment[]>(initialComments);

// Updated comment handler with local state
const onCreateComment = useCallback(
    (commentText: string) => {
        // Create optimistic comment immediately
        const tempId = `temp_${Date.now()}`;
        const optimisticComment = {...};

        // Update UI instantly
        setComments(prev => [...prev, optimisticComment]);

        // Then update server in background
        axios.post('/api/comments', {...})
            .then((response) => {
                // Replace temp comment with real one
                setComments(prev =>
                    prev.map(comment =>
                        comment.id === tempId ? realComment : comment
                    )
                );
            })
            .catch(() => {
                // Remove optimistic comment on failure
                setComments(prev => prev.filter(c => c.id !== tempId));
            });
    },
    [/*dependencies*/]
);
```

## Technical Approach

### 1. State Lifting

We lifted the comments state to the `RecipeClient` component:

```typescript
// In RecipeClient.tsx
const [comments, setComments] = useState<SafeComment[]>(initialComments);
```

This allows us to control and update the comments data independently of the page lifecycle.

### 2. Optimistic Updates

For instant feedback, we implement "optimistic updates":

1. When a user submits a comment, we immediately add it to the UI with a temporary ID
2. The temporary comment is shown with reduced opacity to indicate its pending status
3. We then send the API request asynchronously
4. Upon success, we replace the temporary comment with the real one from the server
5. On failure, we remove the temporary comment and show an error message

### 3. Comment Component API

The Comments component accepts the following props to support the no-refresh approach:

```typescript
interface CommentsProps {
    currentUser?: SafeUser | null;      // Current logged-in user
    onCreateComment: (comment: string) => void;  // Handler for new comments
    comments: SafeComment[];            // Comments array from state
    onDeleteComment?: (commentId: string) => void; // Handler for deletions
    isSubmitting?: boolean;            // Loading state indicator
}
```

## Implementation Details

### State Management

```typescript
// In RecipeClient.tsx
const [comments, setComments] = useState<SafeComment[]>(initialComments);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### Comment Creation with Optimistic Update

```typescript
const onCreateComment = useCallback(
    (commentText: string) => {
        if (!currentUser) return loginModal.onOpen();
        if (isSubmitting) return;

        setIsSubmitting(true);

        // Create temporary comment
        const tempId = `temp_${Date.now()}`;
        const optimisticComment = {...};

        // Update UI immediately
        setComments(prev => [...prev, optimisticComment]);

        // Send to server in background
        axios.post('/api/comments', {
            comment: commentText,
            recipeId: recipe?.id,
        })
        .then((response) => {
            // Find and use real comment data
            if (response.data && response.data.comments) {
                const newServerComment = findMatchingComment(response.data.comments);

                // Replace temp with real
                setComments(prev =>
                    prev.map(comment =>
                        comment.id === tempId ? newServerComment : comment
                    )
                );
            }
        })
        .catch(() => {
            // Revert optimistic update on failure
            setComments(prev => prev.filter(c => c.id !== tempId));
            toast.error(t('something_went_wrong'));
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    },
    [dependencies]
);
```

### Comment Deletion with Optimistic Update

```typescript
const onDeleteComment = useCallback((commentId: string) => {
    // Remove from UI immediately
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

    // Then handle server request
    axios.delete(`/api/comments/${commentId}`)
        .catch(() => {
            // Error handling would go here
            // Could restore the comment if needed
            toast.error(t('delete_failed'));
        });
}, []);
```

## Visual Indicators

We provide visual feedback to users during the update process:

```tsx
// In Comments.tsx
{validComments.map((comment: SafeComment) => {
    const isOptimistic = comment.id.toString().startsWith('temp_');
    return (
        <div key={comment.id} className={`${isOptimistic ? 'opacity-70' : ''}`}>
            <Comment
                // props...
                canDelete={currentUser?.id === comment.userId && !isOptimistic}
            />
        </div>
    );
})}
```

## Benefits of This Approach

1. **Improved UX**: No page flashes or scroll jumps when posting comments
2. **Performance**: Only the comments component re-renders, not the entire page
3. **Reduced Server Load**: No need to re-fetch page data for comment updates
4. **Bandwidth Efficiency**: Avoids downloading already-loaded assets
5. **Instant Feedback**: Users see their comments immediately
6. **Resilience**: Graceful handling of network failures

import axios from 'axios';

export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

export const axiosFetcher = (url: string) =>
    axios.get(url).then((res) => res.data);

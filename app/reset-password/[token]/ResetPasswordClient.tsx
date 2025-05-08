'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Container from '@/app/components/utils/Container';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';
import Button from '@/app/components/buttons/Button';
import { useTranslation } from 'react-i18next';

interface ResetPasswordClientProps {
    token: string;
}

const ResetPasswordClient: React.FC<ResetPasswordClientProps> = ({ token }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const effectRan = useRef(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (effectRan.current) return;
        const validateToken = async () => {
            try {
                const response = await axios.get(
                    `/api/password-reset/validate/${token}`
                );
                if (!response.data.valid) {
                    setIsValid(false);
                    toast.error(
                        t('invalid_or_expired_link') ||
                            'Invalid or expired link'
                    );
                }
            } catch (error) {
                setIsValid(false);
                toast.error(
                    t('invalid_or_expired_link') || 'Invalid or expired link'
                );
                console.error('Error validating token:', error);
            }
        };
        validateToken();
        effectRan.current = true;
    }, [token, t]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error(t('passwords_dont_match') || "Passwords don't match");
            return;
        }

        setIsLoading(true);

        axios
            .post('/api/password-reset/reset', {
                token,
                password: data.password,
            })
            .then(() => {
                toast.success(
                    t('password_reset_success') ||
                        'Password updated successfully'
                );
                router.push('/');
            })
            .catch((error) => {
                toast.error(
                    error.response?.data?.error ||
                        t('something_went_wrong') ||
                        'Something went wrong'
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (!isValid) {
        return (
            <Container>
                <div className="mx-auto max-w-lg py-12">
                    <Heading
                        title={t('invalid_link') || 'Invalid Link'}
                        subtitle={
                            t('link_expired_or_used') ||
                            'The link has expired or has already been used'
                        }
                        center
                    />
                    <div className="mt-6 text-center">
                        <Button
                            label={t('back_to_home') || 'Back to Home'}
                            onClick={() => router.push('/')}
                        />
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="mx-auto max-w-lg py-12">
                <Heading
                    title={t('reset_your_password') || 'Reset Your Password'}
                    subtitle={
                        t('create_new_password') ||
                        'Create a new secure password'
                    }
                    center
                />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <Input
                            id="password"
                            label={t('new_password') || 'New Password'}
                            type="password"
                            disabled={isLoading}
                            register={register}
                            errors={errors}
                            required
                        />
                        <Input
                            id="confirmPassword"
                            label={t('confirm_password') || 'Confirm Password'}
                            type="password"
                            disabled={isLoading}
                            register={register}
                            errors={errors}
                            required
                        />
                        <Button
                            label={
                                isLoading
                                    ? t('updating') || 'Updating...'
                                    : t('update_password') || 'Update Password'
                            }
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        />
                    </form>
                </div>
            </div>
        </Container>
    );
};

export default ResetPasswordClient;

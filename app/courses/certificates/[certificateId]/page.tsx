import { redirect } from 'next/navigation';

interface IParams {
    certificateId?: string;
}

const CourseCertificateRedirectPage = async (props: {
    params: Promise<IParams>;
}) => {
    const params = await props.params;
    const certificateId = params.certificateId || '';
    redirect(`/certificates/${certificateId}`);
};

export default CourseCertificateRedirectPage;

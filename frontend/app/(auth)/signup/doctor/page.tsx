import AuthForm from '@/components/auth/AuthForm';

export const metadata={
    title:'Join MediCare+ as a healthcare provider',
    description:'Register as a healthcare provider on MediCare+ to offer online consultations. '
};

export default function DoctorSignUpPage(){
    return <AuthForm type='signup' userRole='doctor'/>
}
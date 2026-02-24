import loginBg from "../../../public/login/login.png"
import LoginForm from "./components/LoginForm";

export default function Login() {
    return (
        <>
            <div className="w-screen h-screen overflow-hidden relative flex flex-col sm:flex-row bg-teal-600">
                <img src={loginBg} className="h-35 w-full sm:h-screen object-cover " />
                <LoginForm />
            </div>
        </>
    );
}

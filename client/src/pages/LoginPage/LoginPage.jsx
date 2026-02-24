import loginBg from "../../assets/images/login/login.png"
import LoginForm from "./components/LoginForm";

export default function Login() {
    return (
        <>
            <div className="w-screen h-screen overflow-hidden relative flex flex-col sm:flex-row bg-amber-400">
                <img src={loginBg} className="h-35 w-full sm:h-screen object-cover " />
                <LoginForm />
            </div>
        </>
    );
}

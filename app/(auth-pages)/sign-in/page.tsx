import { Message } from "@/components/form-message";
import SignInForm from "./SignInForm";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return <SignInForm searchParams={searchParams} />;
}

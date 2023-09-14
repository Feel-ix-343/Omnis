import { Button } from "./ui/button";

export default function LogoutButton() {
  return (
    <form action="/auth/sign-out" method="post">
      <button className="font-heading text-sm">
        Logout
      </button>
    </form>
  )
}

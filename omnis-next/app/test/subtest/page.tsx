import { Suspense } from "react";
import ClientComponent from "./client-component";
import ServerComponent from "./server-component";

export default function() {
  return<>
    Sub hello
    <ClientComponent>
      <Suspense fallback={<p>Loading...</p>}>
        <ServerComponent />
      </Suspense>
    </ClientComponent>
  </>
}

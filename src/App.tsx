import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
  startRegistration,
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser";

function App() {
  const [userName, setUserName] = useState("");

  const onChangeLogin = useCallback((e: any) => {
    setUserName(e.target.value);
  }, []);

  const onRegister = useCallback(async () => {
    const resp = await fetch(
      "http://localhost:8000/generate-registration-options"
    );

    let attResp;
    try {
      const opts = await resp.json();

      attResp = await startRegistration(opts);
      console.log(
        "Registration Response :>> ",
        JSON.stringify(attResp, null, 2)
      );
    } catch (error) {
      console.log("error :>> ", error);
      throw error;
    }

    const verificationResp = await fetch(
      "http://localhost:8000/verify-registration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attResp),
      }
    );

    const verificationJSON = await verificationResp.json();
    console.log("Server Response", JSON.stringify(verificationJSON, null, 2));

    if (verificationJSON && verificationJSON.verified) {
      alert("Authenticator registered!");
    } else {
      alert(
        `Oh no, something went wrong! Response: ${JSON.stringify(
          verificationJSON
        )}`
      );
    }
  }, [userName]);

  const onAuth = useCallback(async () => {
    const resp = await fetch(
      "http://localhost:8000/generate-authentication-options"
    );

    let asseResp;
    try {
      const opts = await resp.json();
      console.log("Authentication Options", JSON.stringify(opts, null, 2));

      asseResp = await startAuthentication(opts);
      console.log("Authentication Response", JSON.stringify(asseResp, null, 2));
    } catch (error) {
      console.log("error :>> ", error);
      throw new Error(error);
    }

    const verificationResp = await fetch(
      "http://localhost:8000/verify-authentication",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(asseResp),
      }
    );

    const verificationJSON = await verificationResp.json();
    console.log("Server Response", JSON.stringify(verificationJSON, null, 2));

    if (verificationJSON && verificationJSON.verified) {
      alert("User authenticated!");
    } else {
      alert(
        `Oh no, something went wrong! Response:${JSON.stringify(
          verificationJSON
        )}`
      );
    }
  }, [userName]);

  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      alert("It seems this browser doesn't support WebAuthn...");
    }
  }, []);

  return (
    <div className="App">
      <main>
        <div className="section">
          <input onInput={onChangeLogin} placeholder="login" type="text" />
        </div>
        <div className="section">
          <button onClick={onRegister} type="button">
            register
          </button>
        </div>
        <div className="del" />
        <div className="section">
          <button onClick={onAuth} type="button">
            auth
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;

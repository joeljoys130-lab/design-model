"use client";

import LoginView from "./login-view";

export default function ClientAuthPage() {
  const handleLoginSuccess = () => {
    // Reload the page to let the Server Component read the new session cookie and hydrate the app
    window.location.reload();
  };

  return <LoginView onLoginSuccess={handleLoginSuccess} />;
}

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        navigate("/login?error=oauth_failed");
        return;
      }

      if (token) {
        // Store the token
        localStorage.setItem("token", token);

        // Check authentication to get user data
        try {
          await checkAuth();
          navigate("/");
        } catch (err) {
          console.error("Failed to authenticate after OAuth:", err);
          navigate("/login?error=auth_failed");
        }
      } else {
        navigate("/login?error=no_token");
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

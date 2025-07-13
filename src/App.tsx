import AppRoutes from "../routes/Routes";
import { AuthProvider } from "./contexts/AuthContext";

/* bg-gradient-to-b from-[#c4c0c0] to-[#168516] */
/* bg-gradient-to-b from-[#a09c9c] via-[#7bb77b] to-[#168516] text-[#f8f6f6] */
/* bg-gradient-to-b from-[#c4c0c0] to-[#168516] */

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen font-[Lato] w-full flex justify-center bg-radial from-[#4d4c4c] to-[#000000] text-[#adadad]">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
{
}

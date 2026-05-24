import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import { AuthProvider } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { Player } from "./components/Player";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Albums from "./pages/Albums";
import Artists from "./pages/Artists";
import Playlists from "./pages/Playlists";
import Favorites from "./pages/Favorites";
import Logs from "./pages/Logs";
import ThemeEditor from "./pages/ThemeEditor";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { SignupWallModal } from "./components/SignupWallModal";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="*"
              element={
                <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] text-neutral-200 overflow-hidden">
                  <div className="flex flex-1 min-h-0">
                    <Sidebar />
                    <main className="flex-1 min-w-0 overflow-y-auto">
                      <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1600px] mx-auto pb-16">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/search" element={<Search />} />
                          <Route path="/library" element={<Library />} />
                          <Route path="/albums" element={<Albums />} />
                          <Route path="/artists" element={<Artists />} />
                          <Route path="/playlists" element={<Playlists />} />
                          <Route path="/favorites" element={<Favorites />} />
                          <Route path="/logs" element={<Logs />} />
                          <Route path="/theme" element={<ThemeEditor />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                  <Player />
                  <BottomNav />
                </div>
              }
            />
          </Routes>
          <SignupWallModal />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

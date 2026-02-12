import { useEffect, useState } from "react";
import type { Channel, WorkspaceMember } from "../api";
import {
    createChannel,
    createWorkspace,
    getChannels,
    getWorkspaces,
} from "../api";
import ChannelList from "../components/channel/ChannelList";
import Button from "../components/common/Button";
import CreateWorkspace from "../components/workspace/CreateWorkspace";
import WorkspaceList from "../components/workspace/WorkspaceList";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceMember[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getWorkspaces(token);
        setWorkspaces(items);
        const first = items[0]?.workspace?.id ?? null;
        setActiveWorkspaceId(first);
        if (first) {
          const channelList = await getChannels(token, first);
          setChannels(channelList);
        } else {
          setChannels([]);
        }
      } catch {
        setError("Failed to load workspaces.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  const handleCreateWorkspace = async (name: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createWorkspace(token, { name });
      const refreshed = await getWorkspaces(token);
      setWorkspaces(refreshed);
      setActiveWorkspaceId(created.id);
      const channelList = await getChannels(token, created.id);
      setChannels(channelList);
    } catch {
      setError("Unable to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkspace = async (workspaceId: number) => {
    if (!token) return;
    setActiveWorkspaceId(workspaceId);
    setLoading(true);
    setError(null);
    try {
      const channelList = await getChannels(token, workspaceId);
      setChannels(channelList);
    } catch {
      setError("Unable to load channels.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (name: string) => {
    if (!token || !activeWorkspaceId) return;
    setLoading(true);
    setError(null);
    try {
      await createChannel(token, { name, workspaceId: activeWorkspaceId });
      const channelList = await getChannels(token, activeWorkspaceId);
      setChannels(channelList);
    } catch {
      setError("Unable to create channel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Realtime Workspace</p>
          <h1>Team spaces. Channels. Momentum.</h1>
        </div>
        {user ? (
          <div className="user-pill">
            <span>{user.name}</span>
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="pill">Welcome</div>
        )}
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="dashboard">
        <aside className="panel">
          <div className="panel-header">
            <h2>Workspaces</h2>
            <span className="badge">{workspaces.length}</span>
          </div>
          <WorkspaceList
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelect={handleSelectWorkspace}
          />
          <CreateWorkspace onCreate={handleCreateWorkspace} loading={loading} />
        </aside>

        <main className="panel">
          <div className="panel-header">
            <h2>Channels</h2>
            <span className="badge">{channels.length}</span>
          </div>
          {activeWorkspaceId ? (
            <ChannelList
              channels={channels}
              onCreate={handleCreateChannel}
              loading={loading}
            />
          ) : (
            <p className="muted">Select a workspace to view channels.</p>
          )}
        </main>
      </section>
    </>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Channel } from "../api";
import { getChannels } from "../api";
import ChannelList from "../components/channel/ChannelList";
import Chat from "../components/channel/Chat";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const socket = useSocket();
  const { token } = useAuth();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const numericWorkspaceId = workspaceId ? Number(workspaceId) : null;

  // Fetch channels for this workspace
  useEffect(() => {
    const fetchChannels = async () => {
      if (!token || !numericWorkspaceId) return;
      try {
        const data = await getChannels(token, numericWorkspaceId);
        setChannels(data);

        // Auto-select first channel if none selected
        if (data.length > 0 && !selectedChannel) {
          setSelectedChannel(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChannels();
  }, [numericWorkspaceId, token, selectedChannel]);

  // Listen for new channels created in this workspace
  useEffect(() => {
    if (!socket || !numericWorkspaceId) return;

    socket.on("channelCreated", (channel: Channel) => {
      setChannels((prev) => [...prev, channel]);
      // Optionally auto-select newly created channel
      setSelectedChannel(channel);
    });

    return () => {
      socket.off("channelCreated");
    };
  }, [socket, workspaceId]);

  if (!numericWorkspaceId) return <div>Workspace not found</div>;

  return (
    <div className="flex h-screen">
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        onSelect={(channel: Channel) => setSelectedChannel(channel)}
        workspaceId={workspaceId}
      />
      {selectedChannel ? (
        <Chat channelId={selectedChannel.id} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a channel to start chatting
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;

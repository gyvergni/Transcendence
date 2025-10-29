import { FastifyInstance } from "fastify";
import { loginUser, logoutUser } from "../modules/user/user.service";

export async function wsRoute(server: FastifyInstance) {
	const onlineUsers = new Map<number, Set<any>>();

	server.get('/', { websocket: true }, (conn, req) => {
		conn.on('message', async (msg: any) => {
			try {
				const data = JSON.parse(msg.toString());

				if (data.type === "ping") {
					conn.send(JSON.stringify({ type: "pong", online: true }));
					return;
				}
				if (data.type === "auth" && data.token) {
					const user = await server.jwt.verify<{ id: number }>(data.token);
					if (!onlineUsers.has(user.id)) {
						onlineUsers.set(user.id, new Set());
					}
					loginUser(user.id);
					onlineUsers.get(user.id)!.add(conn);
					conn.send(JSON.stringify({ type: 'status', online: true}));
					(conn as any).userId = user.id;
				} 
				else {
					conn.send(JSON.stringify({ type: 'error', message: 'Invalid message type or missing token' }));
					conn.close();
				}
			} catch (err) {
				conn.send(JSON.stringify({type: 'error', message: 'Invalid token' }));
				conn.close();
			}
		})
		conn.on('close', () => {
			const userId = (conn as any).userId;
			if (userId && onlineUsers.has(userId)) {
				onlineUsers.get(userId)!.delete(conn);
				if (onlineUsers.get(userId)!.size === 0) {
					try {
						logoutUser(userId);
						onlineUsers.delete(userId);
					} catch (err) {
						console.error("Error logout user:", err);
					}
				}
			}
		})
	});
}
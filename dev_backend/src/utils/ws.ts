import { log } from "console";
import fastify, { FastifyInstance } from "fastify";
import { loginUser, logoutUser } from "../modules/user/user.service";

export async function wsRoute(server: FastifyInstance) {
	const onlineUsers = new Map<number, Set<any>>();

	server.get('/', { websocket: true }, (conn, req) => {
		conn.on('message', async (msg: any) => {
			// console.log("Received message:", msg.toString());
			try {
				const data = JSON.parse(msg.toString());
				// console.log("Received message:", data);
				if (data.type === "auth" && data.token) {
					const user = await server.jwt.verify<{ id: number }>(data.token);
					if (!onlineUsers.has(user.id)) {
						onlineUsers.set(user.id, new Set());
					}
					loginUser(user.id);
					onlineUsers.get(user.id)!.add(conn);
					console.log("User connected:", user.id, "Total connections:", onlineUsers.get(user.id)!.size);
					conn.send(JSON.stringify({ type: 'status', online: true}));
					(conn as any).userId = user.id;
				}
			} catch (err) {
				console.error("Error processing message:", err);
				conn.send(JSON.stringify({type: 'error', message: 'Invalid token' }));
				conn.close();
			}
		})
		conn.on('close', () => {
			console.log("Connection closed: ");
			const userId = (conn as any).userId;
			if (userId && onlineUsers.has(userId)) {
				onlineUsers.get(userId)!.delete(conn);
				if (onlineUsers.get(userId)!.size === 0) {
					try {
						logoutUser(userId);
						onlineUsers.delete(userId);
						console.log("User disconnected:", userId);
					} catch (err) {
						console.error("Error logout user:", err);
					}
				}
			}
		})
	});
}
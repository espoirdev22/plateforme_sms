const db = require('../config/database');

class Message {
  static async create(messageData) {
    const { 
      userId, 
      phoneNumber, 
      messageText, 
      direction, 
      status = 'pending',
      orangeMessageId = null 
    } = messageData;
    
    const query = `
      INSERT INTO messages (user_id, phone_number, message_text, direction, status, orange_message_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      userId, phoneNumber, messageText, direction, status, orangeMessageId
    ]);
    
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async updateStatus(messageId, status, deliveredAt = null) {
    const query = `
      UPDATE messages 
      SET status = $1, delivered_at = $2 
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [status, deliveredAt, messageId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN direction = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN direction = 'received' THEN 1 END) as received,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
      FROM messages 
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Message;
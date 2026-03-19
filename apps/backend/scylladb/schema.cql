CREATE KEYSPACE IF NOT EXISTS chat_app 
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};

-- 1. The Messages Table
CREATE TABLE IF NOT EXISTS chat_app.messages (
    chat_id text,
    message_id timeuuid,
    sender_id text,
    content text,
    PRIMARY KEY (chat_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- 2. The Last Seen Table (The "Unread" Logic)
CREATE TABLE IF NOT EXISTS chat_app.last_seen (
    user_id text,
    chat_id text,
    last_read timeuuid,
    PRIMARY KEY (user_id, chat_id)
);

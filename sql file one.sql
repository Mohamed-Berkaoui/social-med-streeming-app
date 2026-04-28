BD_Link:postgresql://neondb_owner:npg_oBPjptsWI02F@ep-noisy-hat-anxp36nv-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

CREATE TYPE profile_visibility AS ENUM ('public', 'private', 'friends');


CREATE TYPE message_setting AS ENUM ('all', 'friends_only');



CREATE TABLE Users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    phone VARCHAR(50),
    city VARCHAR(255)
);


CREATE TABLE User_Settings (
    userid UUID NOT NULL,
    profilevisibility profile_visibility DEFAULT 'public',
    friendRequests BOOLEAN DEFAULT TRUE,
    messages message_setting DEFAULT 'all',
    PRIMARY KEY (userid),
    FOREIGN KEY (userid) REFERENCES Users(id) ON DELETE CASCADE
);

-- CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

-- CREATE TABLE Friends (
--     userid UUID NOT NULL,
--     friendId UUID NOT NULL,
--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (userid, friendId),
--     FOREIGN KEY (userid) REFERENCES Users(id) ON DELETE CASCADE,
--     FOREIGN KEY (friendId) REFERENCES Users(id) ON DELETE CASCADE,
--     CHECK (userid <> friendId)
-- );


-- CREATE TABLE Friend_Requests (
--     userid UUID NOT NULL,
--     receiverId UUID NOT NULL,
--     status request_status DEFAULT 'pending',
--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (userid, receiverId),
--     FOREIGN KEY (userid) REFERENCES Users(id) ON DELETE CASCADE,
--     FOREIGN KEY (receiverId) REFERENCES Users(id) ON DELETE CASCADE,
--     CHECK (userid <> receiverId)
-- );


-- CREATE INDEX idx_friends_userid ON Friends(userid);
-- CREATE INDEX idx_friends_friendid ON Friends(friendId);
-- CREATE INDEX idx_friend_requests_receiverid ON Friend_Requests(receiverId);
-- CREATE INDEX idx_friend_requests_status ON Friend_Requests(status);
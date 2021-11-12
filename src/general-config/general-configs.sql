INSERT INTO general_config (name, value) VALUES ('transfer_ooz_to_post_limit', '20');
INSERT INTO general_config (name, value) VALUES ('creator_reward_per_minute_of_posted_video', '25');
INSERT INTO general_config (name, value) VALUES ('creator_reward_for_posted_photo', '15');
INSERT INTO general_config (name, value) VALUES ('user_reward_per_minute_of_watched_video', '0.20');
INSERT INTO general_config (name, value) VALUES ('user_reward_per_minute_of_timeline_view_time', '0.10');
INSERT INTO general_config (name, value) VALUES ('creator_reward_for_woow_received', '0.01');
INSERT INTO general_config (name, value) VALUES ('global_goal_limit_time_in_utc', '00:00:00');
INSERT INTO general_config (name, value) VALUES ('user_sent_sower_invitation_code_ooz', '15');
INSERT INTO general_config (name, value) VALUES ('user_received_sower_invitation_code_ooz', '25');
INSERT INTO general_config (name, value) VALUES ('user_sent_default_invitation_code_ooz', '15');
INSERT INTO general_config (name, value) VALUES ('user_received_default_invitation_code_ooz', '25');
INSERT INTO general_config (name, value) VALUES ('learning_track_per_minute_of_watched_video', '1');

--update after Marcelo send new values

UPDATE general_config SET value = '10' where name = 'creator_reward_per_minute_of_posted_video';
UPDATE general_config SET value = '5' where name = 'creator_reward_for_posted_photo';
UPDATE general_config SET value = '0.05' where name = 'user_reward_per_minute_of_timeline_view_time';
UPDATE general_config SET value = '0.10' where name = 'user_reward_per_minute_of_watched_video';
UPDATE general_config SET value = '0' where name = 'user_reward_per_minute_of_watched_video'; --disable reward to creator for user watched video

UPDATE general_config SET value = '2.50' where name = 'user_sent_sower_invitation_code_ooz';
UPDATE general_config SET value = '10' where name = 'user_received_sower_invitation_code_ooz';
UPDATE general_config SET value = '2.50' where name = 'user_sent_default_invitation_code_ooz';
UPDATE general_config SET value = '10' where name = 'user_received_default_invitation_code_ooz';

--INSERT INTO general_config (name, value) VALUES ('user_reward_when_guest_signup_with_code', '2.50');
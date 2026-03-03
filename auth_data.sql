SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 5bnKETssGxgSCiXVjE6J4FuikkOykfdbfC9VX3CTaYxZwCqJuO325fnWEQvFxP8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('6b46590e-7f9a-487c-b123-e1d0c99316d1', NULL, NULL, NULL, NULL, 'google', '', '', '2026-02-28 07:42:07.895222+00', '2026-02-28 07:42:07.895222+00', 'oauth', NULL, NULL, 'https://easy-split-three.vercel.app', NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6847c545-59fd-4a8a-9c4f-619c84463f5c', 'authenticated', 'authenticated', 'andrew@datapkt.com.tw', NULL, '2026-01-30 12:43:48.726431+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-30 12:43:48.736926+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "112511524554654392374", "name": "Andrew Zheng", "email": "andrew@datapkt.com.tw", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIcnSr6zCUX19gZenNlumCZQspbnXnTw3GH7qOgED8bY6KcNQ=s96-c", "full_name": "Andrew Zheng", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIcnSr6zCUX19gZenNlumCZQspbnXnTw3GH7qOgED8bY6KcNQ=s96-c", "provider_id": "112511524554654392374", "custom_claims": {"hd": "datapkt.com.tw"}, "email_verified": true, "phone_verified": false}', NULL, '2026-01-30 12:43:48.688577+00', '2026-01-30 12:43:48.741415+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '982ac124-7e8c-43cb-aa84-b82a97adee2f', 'authenticated', 'authenticated', 'bemyselfyao@gmail.com', NULL, '2026-01-30 15:40:16.185092+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-30 16:04:05.671223+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "117617832614959158314", "name": "Tsung-Yao Huang", "email": "bemyselfyao@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKEm9ZO30oVMjt_9GURcre8AYSImqqn6nmYe1zI3H5Z1xyRW8O4KA=s96-c", "full_name": "Tsung-Yao Huang", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKEm9ZO30oVMjt_9GURcre8AYSImqqn6nmYe1zI3H5Z1xyRW8O4KA=s96-c", "provider_id": "117617832614959158314", "email_verified": true, "phone_verified": false}', NULL, '2026-01-30 15:40:16.138631+00', '2026-01-31 23:35:06.199146+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0d449633-5667-499f-85c8-8f37b2566490', 'authenticated', 'authenticated', 'mayie641@gmail.com', '$2a$10$aqVRXi2nxIl1l7YUQK1XXunLkMJjdnmJPAuZVHOEDoMXxf0dKbsVm', '2026-02-05 05:10:31.064365+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-05 05:14:03.505755+00', '{"provider": "google", "providers": ["google", "email"]}', '{"iss": "https://accounts.google.com", "sub": "100951119130841380800", "name": "吃魚", "email": "mayie641@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJvoAar94BLyqiLocSBvbIH3yq-pLIVWDIjjqxN3T7xCXXceew-=s96-c", "full_name": "吃魚", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJvoAar94BLyqiLocSBvbIH3yq-pLIVWDIjjqxN3T7xCXXceew-=s96-c", "provider_id": "100951119130841380800", "email_verified": true, "phone_verified": false}', NULL, '2026-02-05 05:10:18.321982+00', '2026-02-05 05:14:03.539328+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', 'authenticated', 'authenticated', 'luoyy30@gmail.com', '$2a$10$d4cKfXFT2OaUYM39JuTv5OVzjavmC5IFAeoHVzLmEihzhoLiujatu', '2026-02-03 17:37:08.472015+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-22 05:50:16.66174+00', '{"provider": "google", "providers": ["google", "email"]}', '{"iss": "https://accounts.google.com", "sub": "114969087403239963976", "name": "Ya Luo", "email": "luoyy30@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJ57nuvhE9tlB3Cpgkx8eqW1geIEU5wbC8aiW6y-8AJ3lERuDJ3=s96-c", "full_name": "Ya Luo", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJ57nuvhE9tlB3Cpgkx8eqW1geIEU5wbC8aiW6y-8AJ3lERuDJ3=s96-c", "provider_id": "114969087403239963976", "email_verified": true, "phone_verified": false}', NULL, '2026-02-03 17:36:52.688022+00', '2026-02-28 12:48:18.725643+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8ec1101e-3666-4e84-911a-301d1f6944ee', 'authenticated', 'authenticated', 'nick.ezpretty@gmail.com', NULL, '2026-01-30 17:44:33.205395+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-30 17:44:33.219303+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "113107894940016969224", "name": "Nick Ez", "email": "nick.ezpretty@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJhScvVDmPJlEfEtkuzdzfal1A0KvaOrNpPUNwr9rKKoPOM2A=s96-c", "full_name": "Nick Ez", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJhScvVDmPJlEfEtkuzdzfal1A0KvaOrNpPUNwr9rKKoPOM2A=s96-c", "provider_id": "113107894940016969224", "email_verified": true, "phone_verified": false}', NULL, '2026-01-30 17:44:33.128039+00', '2026-01-30 17:44:33.259966+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'authenticated', 'authenticated', 'gac712138@gmail.com', '$2a$10$eSDZQumtq4wGeVKEiMc1gOzRoEcTVWQqgTWHITLbs9Xg4xoGBHa2m', '2026-01-29 16:21:15.066186+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-01 16:47:41.551828+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "114629702034051953594", "name": "安志鄭", "email": "gac712138@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJSqfHEHR4JJGOvaffyNSvebvXSvyYt74lMe7K1wgm6VnqKyhdH=s96-c", "full_name": "安志鄭", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJSqfHEHR4JJGOvaffyNSvebvXSvyYt74lMe7K1wgm6VnqKyhdH=s96-c", "provider_id": "114629702034051953594", "email_verified": true, "phone_verified": false}', NULL, '2026-01-29 16:21:15.007431+00', '2026-03-01 16:47:41.580729+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('100951119130841380800', '0d449633-5667-499f-85c8-8f37b2566490', '{"iss": "https://accounts.google.com", "sub": "100951119130841380800", "name": "吃魚", "email": "mayie641@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJvoAar94BLyqiLocSBvbIH3yq-pLIVWDIjjqxN3T7xCXXceew-=s96-c", "full_name": "吃魚", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJvoAar94BLyqiLocSBvbIH3yq-pLIVWDIjjqxN3T7xCXXceew-=s96-c", "provider_id": "100951119130841380800", "email_verified": true, "phone_verified": false}', 'google', '2026-02-05 05:14:03.469163+00', '2026-02-05 05:14:03.469907+00', '2026-02-05 05:14:03.469907+00', 'fa619fde-8ce0-4778-96d2-fcddcdcaa42e'),
	('117617832614959158314', '982ac124-7e8c-43cb-aa84-b82a97adee2f', '{"iss": "https://accounts.google.com", "sub": "117617832614959158314", "name": "Tsung-Yao Huang", "email": "bemyselfyao@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKEm9ZO30oVMjt_9GURcre8AYSImqqn6nmYe1zI3H5Z1xyRW8O4KA=s96-c", "full_name": "Tsung-Yao Huang", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKEm9ZO30oVMjt_9GURcre8AYSImqqn6nmYe1zI3H5Z1xyRW8O4KA=s96-c", "provider_id": "117617832614959158314", "email_verified": true, "phone_verified": false}', 'google', '2026-01-30 15:40:16.176948+00', '2026-01-30 15:40:16.177014+00', '2026-01-30 16:04:05.626829+00', '92f183b0-aa63-4e27-b699-9b2960f5af22'),
	('113107894940016969224', '8ec1101e-3666-4e84-911a-301d1f6944ee', '{"iss": "https://accounts.google.com", "sub": "113107894940016969224", "name": "Nick Ez", "email": "nick.ezpretty@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJhScvVDmPJlEfEtkuzdzfal1A0KvaOrNpPUNwr9rKKoPOM2A=s96-c", "full_name": "Nick Ez", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJhScvVDmPJlEfEtkuzdzfal1A0KvaOrNpPUNwr9rKKoPOM2A=s96-c", "provider_id": "113107894940016969224", "email_verified": true, "phone_verified": false}', 'google', '2026-01-30 17:44:33.194156+00', '2026-01-30 17:44:33.194216+00', '2026-01-30 17:44:33.194216+00', '4ba75923-cad1-439f-aa80-87c66fbf577f'),
	('114969087403239963976', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '{"iss": "https://accounts.google.com", "sub": "114969087403239963976", "name": "Ya Luo", "email": "luoyy30@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJ57nuvhE9tlB3Cpgkx8eqW1geIEU5wbC8aiW6y-8AJ3lERuDJ3=s96-c", "full_name": "Ya Luo", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJ57nuvhE9tlB3Cpgkx8eqW1geIEU5wbC8aiW6y-8AJ3lERuDJ3=s96-c", "provider_id": "114969087403239963976", "email_verified": true, "phone_verified": false}', 'google', '2026-02-03 17:40:50.593894+00', '2026-02-03 17:40:50.593945+00', '2026-02-22 05:50:16.604001+00', '87105ada-f951-408a-bd70-248391cced03'),
	('112511524554654392374', '6847c545-59fd-4a8a-9c4f-619c84463f5c', '{"iss": "https://accounts.google.com", "sub": "112511524554654392374", "name": "Andrew Zheng", "email": "andrew@datapkt.com.tw", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIcnSr6zCUX19gZenNlumCZQspbnXnTw3GH7qOgED8bY6KcNQ=s96-c", "full_name": "Andrew Zheng", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIcnSr6zCUX19gZenNlumCZQspbnXnTw3GH7qOgED8bY6KcNQ=s96-c", "provider_id": "112511524554654392374", "custom_claims": {"hd": "datapkt.com.tw"}, "email_verified": true, "phone_verified": false}', 'google', '2026-01-30 12:43:48.718081+00', '2026-01-30 12:43:48.718133+00', '2026-01-30 12:43:48.718133+00', '74f4ed7b-52ae-476b-a93d-1a0a78918964'),
	('4ecc59a4-69ea-4654-9b0c-d6876438cea7', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '{"sub": "4ecc59a4-69ea-4654-9b0c-d6876438cea7", "email": "luoyy30@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2026-02-03 17:36:52.77066+00', '2026-02-03 17:36:52.770712+00', '2026-02-03 17:36:52.770712+00', '8d900e15-418c-4d8b-9b0d-7a19f2ae4612'),
	('114629702034051953594', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '{"iss": "https://accounts.google.com", "sub": "114629702034051953594", "name": "安志鄭", "email": "gac712138@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJSqfHEHR4JJGOvaffyNSvebvXSvyYt74lMe7K1wgm6VnqKyhdH=s96-c", "full_name": "安志鄭", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJSqfHEHR4JJGOvaffyNSvebvXSvyYt74lMe7K1wgm6VnqKyhdH=s96-c", "provider_id": "114629702034051953594", "email_verified": true, "phone_verified": false}', 'google', '2026-01-29 16:21:15.051393+00', '2026-01-29 16:21:15.051449+00', '2026-02-04 16:59:48.809252+00', 'c203b5c0-5d62-4bf5-b9aa-e7ccee063432'),
	('0d449633-5667-499f-85c8-8f37b2566490', '0d449633-5667-499f-85c8-8f37b2566490', '{"sub": "0d449633-5667-499f-85c8-8f37b2566490", "email": "mayie641@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2026-02-05 05:10:18.387183+00', '2026-02-05 05:10:18.387244+00', '2026-02-05 05:10:18.387244+00', '143f9b79-deda-4901-8d14-3355b1cf361a');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('86a9b0e2-6164-4aee-a68a-8da708bb28d6', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-03 17:40:50.602694+00', '2026-02-07 09:36:02.048787+00', NULL, 'aal1', NULL, '2026-02-07 09:36:02.048687', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '101.10.58.35', NULL, NULL, NULL, NULL, NULL),
	('e55ffac8-2f39-4dff-8e5e-76e13990644f', '982ac124-7e8c-43cb-aa84-b82a97adee2f', '2026-01-30 16:04:05.671322+00', '2026-01-31 23:35:06.251634+00', NULL, 'aal1', NULL, '2026-01-31 23:35:06.25151', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1', '61.223.201.230', NULL, NULL, NULL, NULL, NULL),
	('c7b75ca8-6d01-44e0-a93f-d0eee6a66c2c', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-03-01 16:47:41.554947+00', '2026-03-01 16:47:41.554947+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '124.218.24.209', NULL, NULL, NULL, NULL, NULL),
	('40272ba2-b6e7-49df-9bbc-f30788aef19d', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-03 17:37:08.477825+00', '2026-02-03 17:37:08.477825+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/26.0.2', '124.218.24.209', NULL, NULL, NULL, NULL, NULL),
	('5429ff7a-fd85-4856-ad83-7a5902d3c166', '982ac124-7e8c-43cb-aa84-b82a97adee2f', '2026-01-30 15:40:16.18937+00', '2026-01-30 15:40:16.18937+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/405.0.859829126 Mobile/15E148 Safari/604.1', '49.215.154.189', NULL, NULL, NULL, NULL, NULL),
	('6abc39ed-c610-4c92-9df1-920e6e094911', '8ec1101e-3666-4e84-911a-301d1f6944ee', '2026-01-30 17:44:33.219411+00', '2026-01-30 17:44:33.219411+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '182.235.39.57', NULL, NULL, NULL, NULL, NULL),
	('4ee39f85-a6f4-4f9e-b650-1f54109bf039', '0d449633-5667-499f-85c8-8f37b2566490', '2026-02-05 05:10:31.069273+00', '2026-02-05 05:10:31.069273+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/26.0.2', '203.74.114.60', NULL, NULL, NULL, NULL, NULL),
	('9ef17370-c1d1-4c16-a6e4-f38ad82f6998', '0d449633-5667-499f-85c8-8f37b2566490', '2026-02-05 05:14:03.50585+00', '2026-02-05 05:14:03.50585+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1', '203.74.114.60', NULL, NULL, NULL, NULL, NULL),
	('923d58b9-198d-41ca-a0fe-abfd0a60fc81', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-22 05:50:16.661844+00', '2026-02-28 12:48:18.742224+00', NULL, 'aal1', NULL, '2026-02-28 12:48:18.742123', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '124.218.24.209', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('5429ff7a-fd85-4856-ad83-7a5902d3c166', '2026-01-30 15:40:16.202334+00', '2026-01-30 15:40:16.202334+00', 'oauth', 'f742343f-9e47-456a-bbf1-e0f13060ce6e'),
	('e55ffac8-2f39-4dff-8e5e-76e13990644f', '2026-01-30 16:04:05.707817+00', '2026-01-30 16:04:05.707817+00', 'oauth', 'e077d279-4bb3-4e10-b192-e7f6b2417ca5'),
	('6abc39ed-c610-4c92-9df1-920e6e094911', '2026-01-30 17:44:33.260697+00', '2026-01-30 17:44:33.260697+00', 'oauth', '175afe52-01f3-419d-9b2a-741ccb71d47f'),
	('40272ba2-b6e7-49df-9bbc-f30788aef19d', '2026-02-03 17:37:08.518205+00', '2026-02-03 17:37:08.518205+00', 'otp', 'f261fc89-ae80-4853-8fa4-ac76b60bfc97'),
	('86a9b0e2-6164-4aee-a68a-8da708bb28d6', '2026-02-03 17:40:50.606161+00', '2026-02-03 17:40:50.606161+00', 'oauth', 'ee48ae28-2952-4db0-a872-722261d4d343'),
	('4ee39f85-a6f4-4f9e-b650-1f54109bf039', '2026-02-05 05:10:31.088787+00', '2026-02-05 05:10:31.088787+00', 'otp', 'b1d5cb21-0b8f-4969-9e0b-fd4aafbdc168'),
	('9ef17370-c1d1-4c16-a6e4-f38ad82f6998', '2026-02-05 05:14:03.540158+00', '2026-02-05 05:14:03.540158+00', 'oauth', '496252e2-34cb-45f0-b6c4-15dbb19edf4a'),
	('923d58b9-198d-41ca-a0fe-abfd0a60fc81', '2026-02-22 05:50:16.715111+00', '2026-02-22 05:50:16.715111+00', 'oauth', '724b948e-a36a-436c-b556-9cf27067e6ad'),
	('c7b75ca8-6d01-44e0-a93f-d0eee6a66c2c', '2026-03-01 16:47:41.593925+00', '2026-03-01 16:47:41.593925+00', 'password', '504e5b9d-6908-4edb-bd81-8cea51686909');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 273, 'iljlm3unfgu7', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', false, '2026-02-03 17:37:08.496754+00', '2026-02-03 17:37:08.496754+00', NULL, '40272ba2-b6e7-49df-9bbc-f30788aef19d'),
	('00000000-0000-0000-0000-000000000000', 275, 'ja63lr24zhpk', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-03 17:40:50.603939+00', '2026-02-04 16:43:39.994017+00', NULL, '86a9b0e2-6164-4aee-a68a-8da708bb28d6'),
	('00000000-0000-0000-0000-000000000000', 277, 'mlja6eg45uoj', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-04 16:43:40.028281+00', '2026-02-05 01:32:26.295225+00', 'ja63lr24zhpk', '86a9b0e2-6164-4aee-a68a-8da708bb28d6'),
	('00000000-0000-0000-0000-000000000000', 280, 'ugfioe4ofp6d', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-05 01:32:26.329625+00', '2026-02-05 04:34:43.762419+00', 'mlja6eg45uoj', '86a9b0e2-6164-4aee-a68a-8da708bb28d6'),
	('00000000-0000-0000-0000-000000000000', 282, 'xmd2xurr4vw6', '0d449633-5667-499f-85c8-8f37b2566490', false, '2026-02-05 05:10:31.081112+00', '2026-02-05 05:10:31.081112+00', NULL, '4ee39f85-a6f4-4f9e-b650-1f54109bf039'),
	('00000000-0000-0000-0000-000000000000', 283, 'ibcomfrbial4', '0d449633-5667-499f-85c8-8f37b2566490', false, '2026-02-05 05:14:03.525127+00', '2026-02-05 05:14:03.525127+00', NULL, '9ef17370-c1d1-4c16-a6e4-f38ad82f6998'),
	('00000000-0000-0000-0000-000000000000', 281, 'kr5tboay4ncq', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-05 04:34:43.785054+00', '2026-02-06 15:27:39.347425+00', 'ugfioe4ofp6d', '86a9b0e2-6164-4aee-a68a-8da708bb28d6'),
	('00000000-0000-0000-0000-000000000000', 289, 'wvkofzn24zfw', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-06 15:27:39.379011+00', '2026-02-07 09:36:01.999993+00', 'kr5tboay4ncq', '86a9b0e2-6164-4aee-a68a-8da708bb28d6'),
	('00000000-0000-0000-0000-000000000000', 291, 'cgyvhi64ph6f', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', false, '2026-02-07 09:36:02.015012+00', '2026-02-07 09:36:02.015012+00', 'wvkofzn24zfw', '86a9b0e2-6164-4aee-a68a-8da708bb28d6'),
	('00000000-0000-0000-0000-000000000000', 259, 'ohboo5jbz2es', '982ac124-7e8c-43cb-aa84-b82a97adee2f', false, '2026-01-30 15:40:16.197687+00', '2026-01-30 15:40:16.197687+00', NULL, '5429ff7a-fd85-4856-ad83-7a5902d3c166'),
	('00000000-0000-0000-0000-000000000000', 262, 'nejxd33sjpl5', '8ec1101e-3666-4e84-911a-301d1f6944ee', false, '2026-01-30 17:44:33.2424+00', '2026-01-30 17:44:33.2424+00', NULL, '6abc39ed-c610-4c92-9df1-920e6e094911'),
	('00000000-0000-0000-0000-000000000000', 260, 'hhpraqt5tmtu', '982ac124-7e8c-43cb-aa84-b82a97adee2f', true, '2026-01-30 16:04:05.68714+00', '2026-01-31 23:35:06.144372+00', NULL, 'e55ffac8-2f39-4dff-8e5e-76e13990644f'),
	('00000000-0000-0000-0000-000000000000', 265, '7cufx75d3ejn', '982ac124-7e8c-43cb-aa84-b82a97adee2f', false, '2026-01-31 23:35:06.181253+00', '2026-01-31 23:35:06.181253+00', 'hhpraqt5tmtu', 'e55ffac8-2f39-4dff-8e5e-76e13990644f'),
	('00000000-0000-0000-0000-000000000000', 296, 'gvkvjgrt4ows', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-22 05:50:16.68979+00', '2026-02-22 06:58:42.84902+00', NULL, '923d58b9-198d-41ca-a0fe-abfd0a60fc81'),
	('00000000-0000-0000-0000-000000000000', 297, 'oflafoiw3odr', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-22 06:58:42.863122+00', '2026-02-24 04:15:06.411124+00', 'gvkvjgrt4ows', '923d58b9-198d-41ca-a0fe-abfd0a60fc81'),
	('00000000-0000-0000-0000-000000000000', 298, 'uojmdwa5xd7p', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-24 04:15:06.441832+00', '2026-02-28 08:03:52.882034+00', 'oflafoiw3odr', '923d58b9-198d-41ca-a0fe-abfd0a60fc81'),
	('00000000-0000-0000-0000-000000000000', 300, 'wttq4h32fx3k', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', true, '2026-02-28 08:03:52.906597+00', '2026-02-28 12:48:18.712017+00', 'uojmdwa5xd7p', '923d58b9-198d-41ca-a0fe-abfd0a60fc81'),
	('00000000-0000-0000-0000-000000000000', 303, 'vkoggblk4v5n', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', false, '2026-02-28 12:48:18.721042+00', '2026-02-28 12:48:18.721042+00', 'wttq4h32fx3k', '923d58b9-198d-41ca-a0fe-abfd0a60fc81'),
	('00000000-0000-0000-0000-000000000000', 335, 'r7lcjy7tf6m6', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', false, '2026-03-01 16:47:41.570544+00', '2026-03-01 16:47:41.570544+00', NULL, 'c7b75ca8-6d01-44e0-a93f-d0eee6a66c2c');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 335, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 5bnKETssGxgSCiXVjE6J4FuikkOykfdbfC9VX3CTaYxZwCqJuO325fnWEQvFxP8

RESET ALL;

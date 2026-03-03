SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict qm0OLTU4YwiaqF5jr7wKYDlsvntcSrFycnrc0NkOaW3aQoVYCcYaX9VMfM89BOT

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
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "user_id", "name", "primary_color", "sort_order", "created_at", "icon") VALUES
	('2f222c5d-ae16-4317-ae1b-b1b4e6762661', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '購物', '#49ac1b', 3, '2026-01-29 16:23:23.803169+00', NULL),
	('96b0a84e-c64a-40cd-aee0-cf3f708cc647', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '飲食', '#d12f0b', 0, '2026-01-29 16:22:34.140939+00', NULL),
	('66883306-6604-4adb-bff3-283c51321323', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '交通', '#05f9d8', 1, '2026-01-29 16:22:51.35296+00', NULL),
	('2e8f3e06-f963-4bbc-8da9-3c89e0976786', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '住宿', '#ffb031', 2, '2026-01-29 16:22:56.251626+00', NULL),
	('4500a8d9-2f22-4d13-a27e-2732226a3579', '982ac124-7e8c-43cb-aa84-b82a97adee2f', '交通', '#3a8fb7', 0, '2026-01-30 16:01:30.382887+00', NULL),
	('8f40be1f-9b46-4c86-a184-9e22e966396b', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '假日早午餐', '#3a8fb7', 1, '2026-02-04 16:45:32.052253+00', NULL),
	('5af3baf9-ee90-42d4-b528-32117b236518', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '假日晚餐', '#3a8fb7', 2, '2026-02-04 16:45:38.510409+00', NULL),
	('47c38d2d-b5e0-43ff-9ab8-c643e4b39946', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '平日晚餐', '#3a8fb7', 0, '2026-02-04 16:45:06.067077+00', NULL),
	('7bbdbb3b-660e-4ec0-9cca-b9420c6b9e31', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '食材', '#3a8fb7', 3, '2026-02-04 16:46:28.382249+00', NULL),
	('4cad9c20-c48a-414e-8b7a-67c5750b5380', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '生活用品', '#3a8fb7', 4, '2026-02-04 16:46:48.797456+00', NULL),
	('0b35c82a-8ed1-46cf-a650-f5ca292fcc8e', '0d449633-5667-499f-85c8-8f37b2566490', '飲食', '#3a8fb7', 1, '2026-02-05 05:14:39.108556+00', NULL);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "user_id", "name", "invite_code", "created_at", "status") VALUES
	('f04c170b-250a-4c24-a83b-b74043046c8f', '6847c545-59fd-4a8a-9c4f-619c84463f5c', '測試', '54622d', '2026-01-30 00:00:00+00', 'active'),
	('9bdcd882-07c1-47b9-804e-a8864477743f', '982ac124-7e8c-43cb-aa84-b82a97adee2f', '🇺🇸美國出差兩天', '496181', '2026-01-30 00:00:00+00', 'active'),
	('45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '黃婉寧KTV', '4e5340', '2026-02-03 00:00:00+00', 'archived'),
	('685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '115年3月', '16b9fb', '2026-02-05 00:00:00+00', 'active'),
	('4710ce92-57b0-4494-a62b-113fed45b45b', '0d449633-5667-499f-85c8-8f37b2566490', '吃魚pay', '4739fa', '2026-02-05 00:00:00+00', 'active');


--
-- Data for Name: personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."personnel" ("id", "project_id", "user_id", "linked_user_id", "name", "sort_order", "created_at") VALUES
	('3a64336c-4e2f-432b-aaf4-11d1dfdc8904', 'f04c170b-250a-4c24-a83b-b74043046c8f', NULL, '6847c545-59fd-4a8a-9c4f-619c84463f5c', 'Andrew Zheng', 0, '2026-01-30 12:43:54.031658+00'),
	('6dbd1468-de85-40ad-9896-37c97aceb59d', 'f04c170b-250a-4c24-a83b-b74043046c8f', NULL, '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '安志', 99, '2026-01-30 12:45:21.068148+00'),
	('6c57ca4f-5829-40c3-94ab-7f7211fb2d11', '9bdcd882-07c1-47b9-804e-a8864477743f', NULL, '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '安志', 99, '2026-01-30 15:42:17.625974+00'),
	('f51e32b5-dedf-4315-9fa7-8d304742fabf', '9bdcd882-07c1-47b9-804e-a8864477743f', NULL, '982ac124-7e8c-43cb-aa84-b82a97adee2f', 'Derrick', 0, '2026-01-30 15:41:03.610016+00'),
	('a27f0fc3-423a-4e93-8cf8-6292957ea543', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '安志鄭', 0, '2026-02-02 16:29:50.984227+00'),
	('ce23fe3b-4303-42f8-bab5-14310bfdb18f', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '璒', 1, '2026-02-02 16:30:15.396221+00'),
	('086bda9c-3ad8-4ecb-b6e1-60297280552e', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '亞', 2, '2026-02-02 16:30:09.235081+00'),
	('9698d6d7-16d3-4672-bd3d-3066918e83f2', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '澤', 3, '2026-02-02 16:30:20.465406+00'),
	('d0274f0f-d255-4c96-83dd-c14cdb4b0ab0', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '3', 4, '2026-02-02 16:30:23.492898+00'),
	('6cf38bb9-903c-4bc5-982e-2cef36b6d2e0', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '李', 5, '2026-02-02 16:30:28.126565+00'),
	('d68c3bea-df7a-4414-a126-6ebdc02a5306', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, 'LUBY', 6, '2026-02-02 16:30:37.380733+00'),
	('bd923b7f-e768-446d-a946-142a5f276e0b', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '小裕', 7, '2026-02-02 16:30:48.436801+00'),
	('422d9297-a18d-4d8a-9e63-9f0b60d40b30', '45599f00-65d7-47df-a506-3645a1c91ac0', NULL, NULL, '萱', 8, '2026-02-02 16:30:57.119266+00'),
	('efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '685fe2d0-a1a1-486f-9794-df4605a8cc09', NULL, '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '肥', 0, '2026-02-04 17:00:35.487325+00'),
	('567abdcd-66d3-4648-bb63-96ac9e4d24e2', '4710ce92-57b0-4494-a62b-113fed45b45b', NULL, '0d449633-5667-499f-85c8-8f37b2566490', '吃魚', 0, '2026-02-05 05:11:27.6206+00'),
	('2ed235a2-7449-41e9-9be4-ecf5fec8eef8', '4710ce92-57b0-4494-a62b-113fed45b45b', NULL, '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '智障', 1, '2026-02-05 05:15:01.370268+00'),
	('f6eda2c8-10a3-4853-8573-2c3e10520062', '685fe2d0-a1a1-486f-9794-df4605a8cc09', NULL, '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '亞', 1, '2026-02-04 16:47:25.168627+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "name", "avatar_url", "created_at", "updated_at") VALUES
	('6847c545-59fd-4a8a-9c4f-619c84463f5c', 'andrew@datapkt.com.tw', 'Andrew Zheng', 'https://lh3.googleusercontent.com/a/ACg8ocIcnSr6zCUX19gZenNlumCZQspbnXnTw3GH7qOgED8bY6KcNQ=s96-c', '2026-01-30 12:43:48.670997+00', '2026-01-30 12:43:48.670997+00'),
	('8ec1101e-3666-4e84-911a-301d1f6944ee', 'nick.ezpretty@gmail.com', 'Nick Ez', 'https://lh3.googleusercontent.com/a/ACg8ocJhScvVDmPJlEfEtkuzdzfal1A0KvaOrNpPUNwr9rKKoPOM2A=s96-c', '2026-01-30 17:44:33.058848+00', '2026-01-30 17:44:33.058848+00'),
	('982ac124-7e8c-43cb-aa84-b82a97adee2f', 'bemyselfyao@gmail.com', 'Tsung-Yao Huang', 'https://lh3.googleusercontent.com/a/ACg8ocKEm9ZO30oVMjt_9GURcre8AYSImqqn6nmYe1zI3H5Z1xyRW8O4KA=s96-c', '2026-01-30 15:40:16.126964+00', '2026-01-31 23:35:06.11633+00'),
	('0d449633-5667-499f-85c8-8f37b2566490', 'mayie641@gmail.com', '吃魚', 'https://lh3.googleusercontent.com/a/ACg8ocJvoAar94BLyqiLocSBvbIH3yq-pLIVWDIjjqxN3T7xCXXceew-=s96-c', '2026-02-05 05:10:18.321596+00', '2026-02-05 05:14:03.389528+00'),
	('2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'gac712138@gmail.com', '安志鄭', 'https://lh3.googleusercontent.com/a/ACg8ocJSqfHEHR4JJGOvaffyNSvebvXSvyYt74lMe7K1wgm6VnqKyhdH=s96-c', '2026-01-29 16:21:14.942205+00', '2026-03-01 16:47:41.551614+00'),
	('4ecc59a4-69ea-4654-9b0c-d6876438cea7', 'luoyy30@gmail.com', 'Ya Luo', 'https://lh3.googleusercontent.com/a/ACg8ocJ57nuvhE9tlB3Cpgkx8eqW1geIEU5wbC8aiW6y-8AJ3lERuDJ3=s96-c', '2026-02-03 17:36:52.687632+00', '2026-02-28 12:48:18.703611+00');


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."project_members" ("id", "project_id", "user_id", "role", "joined_at") VALUES
	('fc3d070f-e49c-4fbf-ad90-f34bc28ef928', 'f04c170b-250a-4c24-a83b-b74043046c8f', '6847c545-59fd-4a8a-9c4f-619c84463f5c', 'owner', '2026-01-30 12:43:53.682144+00'),
	('40c9f3c4-5ae5-49a2-8067-f4d92c65c9f9', 'f04c170b-250a-4c24-a83b-b74043046c8f', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'editor', '2026-01-30 12:45:20.68152+00'),
	('318acf94-7372-4fc1-9d20-8d71032af0c3', '9bdcd882-07c1-47b9-804e-a8864477743f', '982ac124-7e8c-43cb-aa84-b82a97adee2f', 'owner', '2026-01-30 15:41:03.178887+00'),
	('4fa3b73c-3581-4be5-acf8-06043f5784da', '9bdcd882-07c1-47b9-804e-a8864477743f', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'editor', '2026-01-30 15:42:17.057612+00'),
	('2e16db1f-add1-488a-ae04-0e5545d01afb', '45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'owner', '2026-02-02 16:29:50.59626+00'),
	('eaa49fe5-e038-402d-a592-f799576cf69f', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', 'owner', '2026-02-04 16:47:24.74947+00'),
	('ea3574f7-b2dc-411e-8e84-0ffa05767d9b', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'editor', '2026-02-04 17:00:35.078576+00'),
	('3d86b137-53e9-4366-92a4-e1a02ed9f419', '4710ce92-57b0-4494-a62b-113fed45b45b', '0d449633-5667-499f-85c8-8f37b2566490', 'owner', '2026-02-05 05:11:27.257887+00'),
	('1fd885c6-aae6-4eb4-a6f3-89d7e1a4864e', '4710ce92-57b0-4494-a62b-113fed45b45b', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'editor', '2026-02-05 05:18:20.697952+00');


--
-- Data for Name: project_settlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."project_settlements" ("id", "project_id", "from_personnel_id", "to_personnel_id", "amount", "is_cleared", "created_at", "remark") VALUES
	('31595078-6b88-4b4c-aa02-251ee91d9dd3', '45599f00-65d7-47df-a506-3645a1c91ac0', '9698d6d7-16d3-4672-bd3d-3066918e83f2', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', 651.67, true, '2026-02-02 17:24:18.708294+00', 'Line pay'),
	('641f7ec3-72c9-4bcf-af85-7823dd06846e', '45599f00-65d7-47df-a506-3645a1c91ac0', 'd0274f0f-d255-4c96-83dd-c14cdb4b0ab0', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', 516.67, true, '2026-02-02 17:24:18.708294+00', 'Line pay'),
	('aff63f70-671b-499b-a819-690eaa7f8850', '45599f00-65d7-47df-a506-3645a1c91ac0', '086bda9c-3ad8-4ecb-b6e1-60297280552e', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', 516.67, true, '2026-02-02 17:24:18.708294+00', '已記帳'),
	('2f5d550e-d497-4b94-8702-6c0a6ba5b1ea', '45599f00-65d7-47df-a506-3645a1c91ac0', 'bd923b7f-e768-446d-a946-142a5f276e0b', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', 641.67, true, '2026-02-02 17:24:18.708294+00', '台新'),
	('e55a346c-156e-413e-bc12-9463181a9abb', '45599f00-65d7-47df-a506-3645a1c91ac0', '422d9297-a18d-4d8a-9e63-9f0b60d40b30', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', 239.98, true, '2026-02-02 17:24:18.708294+00', '台新'),
	('6973d609-5e78-4ea4-9e83-dd6995efd58d', '45599f00-65d7-47df-a506-3645a1c91ac0', 'd68c3bea-df7a-4414-a126-6ebdc02a5306', 'ce23fe3b-4303-42f8-bab5-14310bfdb18f', 206.64, true, '2026-02-02 17:24:18.708294+00', ''),
	('6f99b2b3-4a15-4650-b565-8ef534c1e01d', '45599f00-65d7-47df-a506-3645a1c91ac0', '422d9297-a18d-4d8a-9e63-9f0b60d40b30', 'ce23fe3b-4303-42f8-bab5-14310bfdb18f', 276.69, true, '2026-02-02 17:24:18.708294+00', ''),
	('368ebbae-678d-480c-bda3-c4870d2c27f4', '45599f00-65d7-47df-a506-3645a1c91ac0', '6cf38bb9-903c-4bc5-982e-2cef36b6d2e0', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', 516.67, true, '2026-02-02 17:24:18.708294+00', '');


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transactions" ("id", "project_id", "user_id", "created_by", "payer_id", "debtor_id", "category_id", "title", "amount", "type", "date", "description", "created_at") VALUES
	('3cadcb82-d3f6-4a9c-af4d-73d280f1c16c', '9bdcd882-07c1-47b9-804e-a8864477743f', '982ac124-7e8c-43cb-aa84-b82a97adee2f', NULL, 'f51e32b5-dedf-4315-9fa7-8d304742fabf', '6c57ca4f-5829-40c3-94ab-7f7211fb2d11', '4500a8d9-2f22-4d13-a27e-2732226a3579', '吃飯', 3000, 'debt', '2026-01-31', '', '2026-01-30 16:04:37.456606+00'),
	('2a5eb045-1475-4ae5-9654-f12c926157ac', '45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, 'a27f0fc3-423a-4e93-8cf8-6292957ea543', NULL, '96b0a84e-c64a-40cd-aee0-cf3f708cc647', '黃婉寧 安志', 4650, 'advance', '2026-02-03', '', '2026-02-02 16:31:42.371424+00'),
	('47a66179-6905-47e9-acbb-ab642501e19f', '45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, 'd68c3bea-df7a-4414-a126-6ebdc02a5306', 'bd923b7f-e768-446d-a946-142a5f276e0b', '96b0a84e-c64a-40cd-aee0-cf3f708cc647', '50嵐', 125, 'debt', '2026-02-03', '', '2026-02-02 16:58:53.921663+00'),
	('fb0c8864-c47c-4ce2-96c1-a763d9472b79', '45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, 'd68c3bea-df7a-4414-a126-6ebdc02a5306', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', '96b0a84e-c64a-40cd-aee0-cf3f708cc647', '50嵐', 50, 'debt', '2026-02-03', '', '2026-02-02 16:59:39.418182+00'),
	('074b2f5a-bcb6-4c90-a769-7c04a1222609', '45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, 'd68c3bea-df7a-4414-a126-6ebdc02a5306', '9698d6d7-16d3-4672-bd3d-3066918e83f2', '96b0a84e-c64a-40cd-aee0-cf3f708cc647', '50嵐', 135, 'debt', '2026-02-03', '', '2026-02-02 17:00:49.3506+00'),
	('e8471452-a3de-42c4-8300-287e50e1b23d', '45599f00-65d7-47df-a506-3645a1c91ac0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, 'ce23fe3b-4303-42f8-bab5-14310bfdb18f', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', '96b0a84e-c64a-40cd-aee0-cf3f708cc647', '黃婉寧 璒', 1000, 'debt', '2026-02-03', '', '2026-02-02 16:32:10.940457+00'),
	('d50e7400-2d33-4fa5-bf2b-26418035b211', '4710ce92-57b0-4494-a62b-113fed45b45b', '0d449633-5667-499f-85c8-8f37b2566490', NULL, '567abdcd-66d3-4648-bb63-96ac9e4d24e2', '2ed235a2-7449-41e9-9be4-ecf5fec8eef8', '0b35c82a-8ed1-46cf-a650-f5ca292fcc8e', '舊帳', 4983, 'debt', '2026-02-05', '', '2026-02-05 05:16:21.387197+00'),
	('7e54f1c3-42a2-4308-8c31-cafb0a20cbe2', '4710ce92-57b0-4494-a62b-113fed45b45b', '0d449633-5667-499f-85c8-8f37b2566490', NULL, '567abdcd-66d3-4648-bb63-96ac9e4d24e2', '2ed235a2-7449-41e9-9be4-ecf5fec8eef8', '0b35c82a-8ed1-46cf-a650-f5ca292fcc8e', '丸龜', 237, 'debt', '2026-02-05', '', '2026-02-05 05:18:46.982476+00'),
	('b980ab25-a7c4-449b-9a96-d41f7269add7', '4710ce92-57b0-4494-a62b-113fed45b45b', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, '2ed235a2-7449-41e9-9be4-ecf5fec8eef8', '567abdcd-66d3-4648-bb63-96ac9e4d24e2', '0b35c82a-8ed1-46cf-a650-f5ca292fcc8e', '咖喱飯', 200, 'debt', '2026-02-28', '', '2026-02-28 07:42:47.232588+00'),
	('438e1cd7-23cf-41c9-ad07-429808ab6baa', '4710ce92-57b0-4494-a62b-113fed45b45b', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, '567abdcd-66d3-4648-bb63-96ac9e4d24e2', '2ed235a2-7449-41e9-9be4-ecf5fec8eef8', '0b35c82a-8ed1-46cf-a650-f5ca292fcc8e', '交通', 600, 'debt', '2026-02-28', '', '2026-02-28 07:43:43.264918+00'),
	('8ddc6f81-067f-4910-8c60-8c963ea6619d', '4710ce92-57b0-4494-a62b-113fed45b45b', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, '2ed235a2-7449-41e9-9be4-ecf5fec8eef8', '567abdcd-66d3-4648-bb63-96ac9e4d24e2', '0b35c82a-8ed1-46cf-a650-f5ca292fcc8e', 'Costco', 1796, 'debt', '2026-02-28', '', '2026-02-28 07:44:01.132621+00'),
	('19cd42fa-b8d0-405f-bbef-3f2aaf2b61cf', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', NULL, 'f6eda2c8-10a3-4853-8573-2c3e10520062', NULL, '5af3baf9-ee90-42d4-b528-32117b236518', '12Mini', 343, 'advance', '2026-02-27', '', '2026-02-28 08:05:21.379647+00'),
	('5d5f36bb-3401-45a0-8d56-a4ea4f5ee7bb', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', NULL, 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', NULL, '4cad9c20-c48a-414e-8b7a-67c5750b5380', '柯克蘭衛生紙', 339, 'advance', '2026-02-28', '', '2026-02-28 08:06:41.354033+00'),
	('dfaead3a-13a3-4bf4-af47-746415df8d9e', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', NULL, 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', NULL, '7bbdbb3b-660e-4ec0-9cca-b9420c6b9e31', '好市多食材', 1993, 'advance', '2026-02-28', '', '2026-02-28 08:09:49.509512+00'),
	('85ff5cb1-1b92-4bf6-a745-85590e53f54a', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', NULL, 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', NULL, '7bbdbb3b-660e-4ec0-9cca-b9420c6b9e31', '梅乃宿梅酒', 699, 'advance', '2026-02-28', '', '2026-02-28 08:12:16.490217+00'),
	('7cd8e0f3-a1b2-4f2e-ac32-c40720eeea94', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', NULL, 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '7bbdbb3b-660e-4ec0-9cca-b9420c6b9e31', '高鈣起司球', 239, 'debt', '2026-02-28', '', '2026-02-28 08:10:40.580829+00'),
	('15256f2e-5597-419a-b17e-038f0ebb6afd', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', NULL, 'f6eda2c8-10a3-4853-8573-2c3e10520062', NULL, '8f40be1f-9b46-4c86-a184-9e22e966396b', '美華大腸圈', 285, 'advance', '2026-02-28', '', '2026-02-28 08:19:39.652717+00'),
	('9cb5e856-26ad-484d-a5b2-519885ea63b2', '685fe2d0-a1a1-486f-9794-df4605a8cc09', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', NULL, 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', NULL, '8f40be1f-9b46-4c86-a184-9e22e966396b', '當歸鴨', 410, 'advance', '2026-02-28', '', '2026-02-28 12:41:50.170201+00');


--
-- Data for Name: transaction_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transaction_participants" ("id", "transaction_id", "personnel_id", "user_id", "created_at") VALUES
	('1218d8b4-ee81-4d09-a807-a8d84280370e', '2a5eb045-1475-4ae5-9654-f12c926157ac', 'a27f0fc3-423a-4e93-8cf8-6292957ea543', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('5c7c8a10-ca0a-4675-a4ef-05566e5605dc', '2a5eb045-1475-4ae5-9654-f12c926157ac', '086bda9c-3ad8-4ecb-b6e1-60297280552e', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('4f5d0038-629d-4260-86ef-19f1496193bd', '2a5eb045-1475-4ae5-9654-f12c926157ac', 'ce23fe3b-4303-42f8-bab5-14310bfdb18f', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('73b90722-0e5b-454d-8bde-48335ac1e487', '2a5eb045-1475-4ae5-9654-f12c926157ac', '9698d6d7-16d3-4672-bd3d-3066918e83f2', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('7d2cb20f-88c8-48c2-af6a-af5a0251d1a4', '2a5eb045-1475-4ae5-9654-f12c926157ac', 'd0274f0f-d255-4c96-83dd-c14cdb4b0ab0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('b57d3525-8902-4b55-86fe-bd6a8d70ee6c', '2a5eb045-1475-4ae5-9654-f12c926157ac', '6cf38bb9-903c-4bc5-982e-2cef36b6d2e0', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('daeb3094-81c0-44ed-9f31-07689e797b69', '2a5eb045-1475-4ae5-9654-f12c926157ac', 'd68c3bea-df7a-4414-a126-6ebdc02a5306', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('d53b9e5b-2ce7-4c53-95cb-69b6e73db9a8', '2a5eb045-1475-4ae5-9654-f12c926157ac', 'bd923b7f-e768-446d-a946-142a5f276e0b', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('69c4fcb1-c7b6-4ea5-9ec9-47296f1b2c2e', '2a5eb045-1475-4ae5-9654-f12c926157ac', '422d9297-a18d-4d8a-9e63-9f0b60d40b30', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-02 16:43:51.97237+00'),
	('275f4539-3f4b-4bc5-a7ea-0b5d1283dea7', '19cd42fa-b8d0-405f-bbef-3f2aaf2b61cf', 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:05:21.831388+00'),
	('396c8ce9-3887-47c4-b4e1-9acd90049b2a', '19cd42fa-b8d0-405f-bbef-3f2aaf2b61cf', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:05:21.831388+00'),
	('57bbcc38-82cc-4a65-817b-76a5bfef7a13', '5d5f36bb-3401-45a0-8d56-a4ea4f5ee7bb', 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:06:51.862918+00'),
	('9046ce2c-af42-4d58-94ef-32c9a6a78056', '5d5f36bb-3401-45a0-8d56-a4ea4f5ee7bb', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:06:51.862918+00'),
	('3582ab4a-6e60-4e34-8d99-cbcebc5b5658', 'dfaead3a-13a3-4bf4-af47-746415df8d9e', 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:09:49.946692+00'),
	('0596700d-cf9e-4cfb-9482-1970d5b400f4', 'dfaead3a-13a3-4bf4-af47-746415df8d9e', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:09:49.946692+00'),
	('159715a7-8e05-4af5-8a36-408209e9f6ec', '85ff5cb1-1b92-4bf6-a745-85590e53f54a', 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:12:16.905154+00'),
	('42d58d42-4d6b-46f0-aa95-27589f853948', '85ff5cb1-1b92-4bf6-a745-85590e53f54a', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:12:16.905154+00'),
	('ae261161-1d40-4c28-aabd-c9fba40572cb', '15256f2e-5597-419a-b17e-038f0ebb6afd', 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:19:40.117174+00'),
	('4d681b26-ec16-421a-ba89-b44871cf7ff3', '15256f2e-5597-419a-b17e-038f0ebb6afd', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', '2026-02-28 08:19:40.117174+00'),
	('9f2fd392-b367-4ffb-ac6f-2f198f8a0f2c', '9cb5e856-26ad-484d-a5b2-519885ea63b2', 'efe8729f-8b46-4b3f-8ce4-dc9de6c0cbb3', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-28 12:41:50.559222+00'),
	('c553be37-139a-41d0-b2ea-8e36dffd5ee4', '9cb5e856-26ad-484d-a5b2-519885ea63b2', 'f6eda2c8-10a3-4853-8573-2c3e10520062', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', '2026-02-28 12:41:50.559222+00');


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_settings" ("id", "user_id", "key", "value", "updated_at") VALUES
	('7b290962-7b6e-4c79-969f-929a54f6b3d2', '982ac124-7e8c-43cb-aa84-b82a97adee2f', 'theme_primary', '#834040', '2026-01-30 15:42:13.233+00'),
	('9468aeeb-1d9e-4442-84d2-44c2370d6ed1', '8ec1101e-3666-4e84-911a-301d1f6944ee', 'theme_primary', '#0099ff', '2026-01-30 17:45:11.633+00'),
	('c4c4b46c-db5c-42d3-9461-7770320f8a78', '2f6cbe9e-f570-4bf5-8f4a-977b3dfa67cb', 'theme_primary', '#12d7b6', '2026-01-31 10:45:15.637+00'),
	('27de5157-4298-48f8-9716-5c742d54958c', '4ecc59a4-69ea-4654-9b0c-d6876438cea7', 'theme_primary', '#105799', '2026-02-04 16:44:27.747+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 335, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict qm0OLTU4YwiaqF5jr7wKYDlsvntcSrFycnrc0NkOaW3aQoVYCcYaX9VMfM89BOT

RESET ALL;

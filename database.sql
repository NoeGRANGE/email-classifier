-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.billing_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stripe_price_id text NOT NULL UNIQUE,
  plan USER-DEFINED NOT NULL,
  mailbox_limit integer NOT NULL,
  CONSTRAINT billing_prices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.category (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  description text NOT NULL,
  configuration_id bigint NOT NULL,
  CONSTRAINT category_pkey PRIMARY KEY (id),
  CONSTRAINT category_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.configurations(id)
);
CREATE TABLE public.category_actions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying NOT NULL,
  props jsonb NOT NULL,
  category_id bigint NOT NULL,
  CONSTRAINT category_actions_pkey PRIMARY KEY (id),
  CONSTRAINT category_actions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id)
);
CREATE TABLE public.configurations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  user_auth_user_id uuid NOT NULL,
  CONSTRAINT configurations_pkey PRIMARY KEY (id),
  CONSTRAINT configurations_user_auth_user_id_fkey FOREIGN KEY (user_auth_user_id) REFERENCES public.users(auth_user_id)
);
CREATE TABLE public.mail_subscriptions (
  id character varying NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  renewal_errors bigint NOT NULL DEFAULT '0'::bigint,
  notifications_received bigint NOT NULL DEFAULT '0'::bigint,
  outlook_credentials_id integer,
  CONSTRAINT mail_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT mail_subscriptions_outlook_credentials_id_fkey FOREIGN KEY (outlook_credentials_id) REFERENCES public.outlook_credentials(id)
);
CREATE TABLE public.members (
  id integer NOT NULL DEFAULT nextval('invites_id_seq'::regclass),
  org_id integer NOT NULL,
  email character varying NOT NULL,
  token character varying,
  role character varying NOT NULL DEFAULT 'member'::character varying,
  authorized_emails integer NOT NULL DEFAULT 1,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_auth_user_id uuid,
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT fk_org FOREIGN KEY (org_id) REFERENCES public.organisations(id),
  CONSTRAINT invites_user_auth_user_id_fkey FOREIGN KEY (user_auth_user_id) REFERENCES public.users(auth_user_id)
);
CREATE TABLE public.organisations (
  id integer NOT NULL DEFAULT nextval('organisations_id_seq'::regclass),
  name character varying NOT NULL,
  seats_purchased integer NOT NULL DEFAULT 0,
  seats_used integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subscription_type character varying,
  owner_user_id uuid NOT NULL UNIQUE,
  CONSTRAINT organisations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user FOREIGN KEY (owner_user_id) REFERENCES public.users(auth_user_id)
);
CREATE TABLE public.outlook_credentials (
  id integer NOT NULL DEFAULT nextval('outlook_credentials_id_seq'::regclass),
  user_auth_user_id uuid NOT NULL,
  account_id character varying NOT NULL UNIQUE,
  token_type character varying,
  access_token character varying NOT NULL,
  refresh_token character varying NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  email character varying NOT NULL,
  activated boolean NOT NULL DEFAULT true,
  configuration_id bigint,
  CONSTRAINT outlook_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_cred FOREIGN KEY (user_auth_user_id) REFERENCES public.users(auth_user_id),
  CONSTRAINT outlook_credentials_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.configurations(id)
);
CREATE TABLE public.stripe_events (
  id text NOT NULL,
  type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stripe_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  auth_user_id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  org_id integer,
  stripe_customer_id text,
  current_plan USER-DEFINED,
  current_price_id text,
  subscription_status text,
  current_period_end timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (auth_user_id),
  CONSTRAINT users_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organisations(id)
);
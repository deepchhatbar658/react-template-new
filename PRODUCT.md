# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers building authenticated dashboards, SaaS applications, admin panels, customer portals, CRUD-heavy products, and other API-driven client applications.

## Product Purpose

This repository is a reusable production foundation. Success means teams can start feature work without first rebuilding request safety, authentication refresh, server-state conventions, testing infrastructure, or repository maintenance.

## Positioning

The template treats the network boundary as its primary product: native fetch stays replaceable, TanStack Query exclusively owns server state, and every external response crosses an explicit parsing and validation boundary.

## Operating Context

The repository is cloned as the starting point for long-lived React products. Developers use the included MSW API locally and in tests, then replace mock endpoints incrementally with a real cookie-authenticated backend.

## Capabilities and Constraints

Client-rendered React only; Vite, strict TypeScript, React Router library mode, TanStack Query, Zod, native fetch, CSS Modules, Vitest, MSW, and Playwright. It is not an SSR framework, monorepo, UI framework, generated API client, or global-state starter.

## Evidence on Hand

The user's implementation specification is the sole product authority. Names, customers, prices, performance claims, and production API behavior must not be invented.

## Product Principles

- Preserve clear dependency direction and feature ownership.
- Make network failures observable, normalized, cancellable, and testable.
- Prefer concrete feature code over speculative generic abstractions.
- Keep successful server data visible during background work.
- Make extension paths teachable through executable examples and documentation.

## Accessibility & Inclusion

The example application must be keyboard-usable, responsive, and provide accessible labels, focus indicators, error associations, and live status announcements.

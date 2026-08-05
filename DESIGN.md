---
name: Atlas Console
description: A calm, information-dense operational shell for API-driven products
colors:
  ink: '#111827'
  canvas: '#f5f7fb'
  surface: '#ffffff'
  primary: '#4f46e5'
  primary-deep: '#3730a3'
  border: '#d8deea'
  danger: '#b42318'
  success: '#16794a'
  warning: '#f6d365'
  warning-text: '#2c2100'
typography:
  body:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)'
    fontWeight: 700
    lineHeight: 1.1
  label:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 700
    lineHeight: 1.4
rounded:
  sm: '0.5rem'
  md: '0.75rem'
  lg: '1rem'
  pill: '999px'
spacing:
  sm: '0.5rem'
  md: '1rem'
  lg: '1.5rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.sm}'
    padding: '0.65rem 1rem'
---

# Design System: Atlas Console

## Overview

**Creative North Star: "The Operations Ledger"**

Atlas Console is a restrained operational interface: legible under long sessions, dense enough for real work, and quiet enough that loading, errors, mutations, and offline state remain the strongest signals. It avoids decorative dashboard theatrics and lets state changes provide the visual rhythm.

## Colors

Near-black ink and cool neutral surfaces use indigo only for decisions and navigation. Success and danger colors communicate status, never decoration.

## Typography

The system stack keeps setup dependency-free and renders crisply across platforms. Headings use weight and spacing—not novelty—to establish hierarchy; body copy stays below 75 characters per line.

## Layout

A persistent but responsive app rail frames a fluid work area. Lists are dense on desktop and become stacked records on narrow screens. The 8px spacing base distinguishes related controls from page-level sections.

## Elevation & Depth

Tonal layering is primary. A soft offset shadow is reserved for transient overlays and elevated forms; bordered surfaces do not also receive large shadows.

## Shapes

Controls use 8px corners, work surfaces 12px, and major shells 16px. Pills are reserved for compact status and filter controls.

## Components

Buttons are compact and explicit. Fields keep labels visible. Tables preserve alignment on wide screens and expose each field name in the mobile layout. Loading and error treatments live near the content they affect.

## Do's and Don'ts

- **Do** keep successful data visible during background refetches.
- **Do** reserve the primary accent for actions, focus, and active navigation.
- **Do** make recovery actions specific and keyboard reachable.
- **Don't** use decorative gradients, glass effects, or generic metric-card grids.
- **Don't** turn routine CRUD work into modal-heavy interaction.
- **Don't** communicate network state by color alone.

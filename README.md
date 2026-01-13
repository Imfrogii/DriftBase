# Drift Events Platform — Product Case

> Product & engineering case study of a niche event platform for drift community

## TL;DR

This repository contains a **fully implemented MVP** of a niche event platform built to solve a real-world problem in the drift motorsport community: **event discovery, registration, and organizer tooling**.

The project was developed end-to-end (product, UX, architecture, implementation) by a single senior engineer with strong product ownership. The goal was **not a hobby project**, but a realistic attempt to validate a market opportunity and ship a production-ready system.

The project is currently **paused** due to market timing and competitive landscape changes, but remains a complete and valuable **product case**.

---

## Problem

### User side (drivers / participants)

* Events are scattered across Facebook, Instagram, forums, and Google Sheets
* No single place to discover upcoming drift events
* Manual registration via messages or forms
* No clear status (confirmed / waitlist / cancelled)
* On-site check-in is slow and error-prone

### Organizer side

* Manual handling of registrations and payments
* No centralized participant lists
* No easy way to handle cancellations or refunds
* No tooling for event-day operations (check-in, validation)
* Poor visibility into demand and attendance

This problem has existed for **years**, especially in local drift communities.

---

## Solution

A web platform that acts as a **single entry point** for drift events, covering both sides:

### For drivers

* Discover events based on location and distance
* Register for events online
* Receive QR-based tickets
* View registration status and history

### For organizers

* Create and manage events
* Accept online payments
* Manage participant lists
* Handle cancellations
* Validate entries via QR codes on-site

The focus was on **removing manual work**, **reducing friction**, and **making event participation predictable**.

---

## Key Product Decisions

### 1. Niche-first approach

Instead of a generic event platform, the product was intentionally focused on **one motorsport niche** to:

* deeply understand workflows
* build trust with organizers
* avoid over-generalization

### 2. Organizer-centric value

While drivers are the majority of users, **organizers are the paying customers**. Many decisions were optimized for:

* time savings
* operational simplicity
* reduced human error

### 3. Realistic monetization

Monetization model was based on **per-event commission**, aligned with organizer revenue, instead of subscriptions.

---

## Core Features

### Event discovery

* Location-based filtering
* Distance-based sorting
* Upcoming / past events separation

### Registration system

* Limited slots per event
* Waitlist support
* Registration cancellation
* Status tracking

### Payments

* Online payment integration
* Payment status validation
* Organizer-side visibility

### Event-day operations

* QR code generation per registration
* QR validation for check-in
* Real-time participant status

### Organizer tools

* Dashboard with registrations overview
* Participant export
* Event lifecycle management

---

## What Was Built (Scope)

* Full frontend application
* Backend API
* Database schema
* Auth & role separation (drivers / organizers)
* Payment flow
* QR-based validation flow

This is **not a mock or prototype** — it is a working system designed for real usage.

---

## Why the Project Is Paused

During development, similar platforms launched in the same market almost simultaneously. After re-evaluating:

* total addressable market
* organizer count per region
* realistic revenue ceiling

The project was paused to avoid over-investing in a **structurally small niche**.

This decision was a **product decision**, not a technical failure.

---

## What This Project Demonstrates

* End-to-end product thinking
* Ability to identify real user pain points
* Translating domain knowledge into product features
* Building production-ready systems under time constraints
* Making hard product calls based on market reality

---

## Target Audience of This Repository

This repository is shared publicly as:

* a **product case study**
* an example of product-driven engineering
* a reference for architecture and feature scoping

It is **not actively maintained** and is not positioned as a commercial product.

---

## Tech Stack (High-level)

> Details intentionally kept high-level to focus on product decisions rather than framework specifics.

* Modern frontend framework (Next.JS, Typescript)
* Backend API with auth and payments (Next.JS, Supabase Auth, Stripe)
* Relational database (Supabase)
* Cloud-ready architecture

---

## Author Note

This project represents a meaningful milestone in my transition from **senior frontend engineer** to **product-oriented leadership roles**.

While the product itself is paused, the **experience and insights gained** are actively shaping my next steps.

---

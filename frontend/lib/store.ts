"use client";

/**
 * Main Store Hub
 * 
 * This file re-exports all slices and constants to maintain backward compatibility
 * while keeping the physical files small and maintainable.
 */

export * from "./stores/constants";
export { useAuthStore } from "./stores/authStore";
export * from "./stores/dashboard";
export * from "./stores/families";
export * from "./stores/householdStore";
export * from "./stores/wizardStore";
export * from "./stores/scoringStore";
export * from "./stores/adminStore";

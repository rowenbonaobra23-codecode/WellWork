/**
 * ============================================================================
 * MOBILE CONFIGURATION - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS FILE DO?
 * -----------------------
 * Provides mobile-specific configuration and utilities for Capacitor.
 * Handles API URL detection for mobile vs web environments.
 * 
 * HOW IT WORKS:
 * ------------
 * - Detects if running in Capacitor mobile app
 * - Provides appropriate API URL for mobile (can't use localhost)
 * - Handles mobile-specific features
 * 
 * API URL CONFIGURATION:
 * ---------------------
 * For mobile apps, you need to use your computer's IP address instead of localhost.
 * Example: http://192.168.1.100:5000
 * 
 * To find your IP:
 * - Windows: ipconfig (look for IPv4 Address)
 * - Mac/Linux: ifconfig or ip addr
 * 
 * ============================================================================
 */

import { Capacitor } from '@capacitor/core'

/**
 * Check if running in mobile app
 */
export const isMobile = Capacitor.isNativePlatform()

/**
 * Get API base URL based on environment
 * For mobile: Use your computer's IP address (not localhost)
 * For web: Use localhost or environment variable
 */
export function getApiBaseUrl() {
  // Check if running in Capacitor mobile app
  if (isMobile) {
    // For mobile, use your computer's IP address
    // Replace with your actual IP address or use environment variable
    return import.meta.env.VITE_API_URL || 'http://192.168.100.185:5000'
  }
  
  // For web, use localhost or environment variable
  return import.meta.env.VITE_API_URL || 'http://localhost:5000'
}

/**
 * Initialize mobile-specific features
 */
export function initMobileFeatures() {
  if (isMobile) {
    // Mobile-specific initialization can go here
    console.log('Running in mobile app mode')
  }
}




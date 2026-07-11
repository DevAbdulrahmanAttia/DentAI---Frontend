/**
 * Development environment configuration
 *
 * This file replaces environment.ts during development builds.
 * Angular CLI's fileReplacements configuration in angular.json
 * automatically swaps this file for environment.ts when running:
 *   - ng serve (default development configuration)
 *   - ng build (without production flag)
 *
 * Set 'production' to false to enable development features and logging.
 */

export const environment = {
  production: false,
  appName: 'DentAI',
  apiUrl: 'http://localhost:8000/api/v1',
  version: '1.0.0'
};

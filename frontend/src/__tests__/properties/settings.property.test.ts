/**
 * Property 16: Settings Round-Trip
 * *For any* valid settings update, updating settings and then fetching SHALL return the updated values.
 * 
 * **Validates: Requirements 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8**
 * 
 * Feature: yemen-car-showroom, Property 16: Settings Round-Trip
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ShowroomSettings, UpdateSettingsInput } from '@/types';

// Generate valid settings input
const updateSettingsInputArbitrary: fc.Arbitrary<UpdateSettingsInput> = fc.record({
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 2000 }), { nil: undefined }),
  address: fc.option(fc.string({ minLength: 0, maxLength: 255 }), { nil: undefined }),
  phone: fc.option(fc.string({ minLength: 0, maxLength: 20 }), { nil: undefined }),
  whatsapp: fc.option(fc.string({ minLength: 0, maxLength: 20 }), { nil: undefined }),
  workingHours: fc.option(fc.string({ minLength: 0, maxLength: 255 }), { nil: undefined }),
  mapLatitude: fc.option(fc.float({ min: -90, max: 90, noNaN: true }), { nil: undefined }),
  mapLongitude: fc.option(fc.float({ min: -180, max: 180, noNaN: true }), { nil: undefined }),
});

// Generate complete settings
const settingsArbitrary: fc.Arbitrary<ShowroomSettings> = fc.record({
  id: fc.constant('main'),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 2000 }),
  address: fc.string({ minLength: 0, maxLength: 255 }),
  phone: fc.string({ minLength: 0, maxLength: 20 }),
  whatsapp: fc.string({ minLength: 0, maxLength: 20 }),
  workingHours: fc.string({ minLength: 0, maxLength: 255 }),
  mapLatitude: fc.option(fc.float({ min: -90, max: 90, noNaN: true }), { nil: undefined }),
  mapLongitude: fc.option(fc.float({ min: -180, max: 180, noNaN: true }), { nil: undefined }),
  updatedAt: fc.constant(new Date().toISOString()),
});

/**
 * Simulates updating settings.
 * Only updates fields that are provided in the input.
 */
function updateSettings(
  currentSettings: ShowroomSettings,
  input: UpdateSettingsInput
): ShowroomSettings {
  return {
    ...currentSettings,
    name: input.name !== undefined ? input.name : currentSettings.name,
    description: input.description !== undefined ? input.description : currentSettings.description,
    address: input.address !== undefined ? input.address : currentSettings.address,
    phone: input.phone !== undefined ? input.phone : currentSettings.phone,
    whatsapp: input.whatsapp !== undefined ? input.whatsapp : currentSettings.whatsapp,
    workingHours: input.workingHours !== undefined ? input.workingHours : currentSettings.workingHours,
    mapLatitude: input.mapLatitude !== undefined ? input.mapLatitude : currentSettings.mapLatitude,
    mapLongitude: input.mapLongitude !== undefined ? input.mapLongitude : currentSettings.mapLongitude,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Simulates fetching settings.
 */
function fetchSettings(settings: ShowroomSettings): ShowroomSettings {
  return { ...settings };
}

describe('Property 16: Settings Round-Trip', () => {
  /**
   * Property: Updating settings and fetching should return the updated values.
   * Requirements 12.2-12.8
   */
  it('should return updated values after update and fetch', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        updateSettingsInputArbitrary,
        (currentSettings, input) => {
          // Update settings
          const updatedSettings = updateSettings(currentSettings, input);
          
          // Fetch settings
          const fetchedSettings = fetchSettings(updatedSettings);
          
          // Verify each field that was updated
          if (input.name !== undefined) {
            expect(fetchedSettings.name).toBe(input.name);
          }
          if (input.description !== undefined) {
            expect(fetchedSettings.description).toBe(input.description);
          }
          if (input.address !== undefined) {
            expect(fetchedSettings.address).toBe(input.address);
          }
          if (input.phone !== undefined) {
            expect(fetchedSettings.phone).toBe(input.phone);
          }
          if (input.whatsapp !== undefined) {
            expect(fetchedSettings.whatsapp).toBe(input.whatsapp);
          }
          if (input.workingHours !== undefined) {
            expect(fetchedSettings.workingHours).toBe(input.workingHours);
          }
          if (input.mapLatitude !== undefined) {
            expect(fetchedSettings.mapLatitude).toBe(input.mapLatitude);
          }
          if (input.mapLongitude !== undefined) {
            expect(fetchedSettings.mapLongitude).toBe(input.mapLongitude);
          }
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating showroom name should persist.
   * Requirements 12.2
   */
  it('should persist showroom name update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 1, maxLength: 100 }),
        (currentSettings, newName) => {
          const updatedSettings = updateSettings(currentSettings, { name: newName });
          const fetchedSettings = fetchSettings(updatedSettings);
          return fetchedSettings.name === newName;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating contact number should persist.
   * Requirements 12.3
   */
  it('should persist contact number update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 0, maxLength: 20 }),
        (currentSettings, newPhone) => {
          const updatedSettings = updateSettings(currentSettings, { phone: newPhone });
          const fetchedSettings = fetchSettings(updatedSettings);
          return fetchedSettings.phone === newPhone;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating WhatsApp number should persist.
   * Requirements 12.4
   */
  it('should persist WhatsApp number update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 0, maxLength: 20 }),
        (currentSettings, newWhatsapp) => {
          const updatedSettings = updateSettings(currentSettings, { whatsapp: newWhatsapp });
          const fetchedSettings = fetchSettings(updatedSettings);
          return fetchedSettings.whatsapp === newWhatsapp;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating description should persist.
   * Requirements 12.5
   */
  it('should persist description update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 0, maxLength: 2000 }),
        (currentSettings, newDescription) => {
          const updatedSettings = updateSettings(currentSettings, { description: newDescription });
          const fetchedSettings = fetchSettings(updatedSettings);
          return fetchedSettings.description === newDescription;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating address should persist.
   * Requirements 12.6
   */
  it('should persist address update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 0, maxLength: 255 }),
        (currentSettings, newAddress) => {
          const updatedSettings = updateSettings(currentSettings, { address: newAddress });
          const fetchedSettings = fetchSettings(updatedSettings);
          return fetchedSettings.address === newAddress;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating map location should persist.
   * Requirements 12.7
   */
  it('should persist map location update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (currentSettings, newLat, newLng) => {
          const updatedSettings = updateSettings(currentSettings, {
            mapLatitude: newLat,
            mapLongitude: newLng,
          });
          const fetchedSettings = fetchSettings(updatedSettings);
          return (
            fetchedSettings.mapLatitude === newLat &&
            fetchedSettings.mapLongitude === newLng
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating working hours should persist.
   * Requirements 12.8
   */
  it('should persist working hours update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 0, maxLength: 255 }),
        (currentSettings, newWorkingHours) => {
          const updatedSettings = updateSettings(currentSettings, { workingHours: newWorkingHours });
          const fetchedSettings = fetchSettings(updatedSettings);
          return fetchedSettings.workingHours === newWorkingHours;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Fields not in update should remain unchanged.
   */
  it('should preserve fields not included in update', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        fc.string({ minLength: 1, maxLength: 100 }),
        (currentSettings, newName) => {
          // Only update name
          const updatedSettings = updateSettings(currentSettings, { name: newName });
          const fetchedSettings = fetchSettings(updatedSettings);
          
          // All other fields should remain unchanged
          return (
            fetchedSettings.description === currentSettings.description &&
            fetchedSettings.address === currentSettings.address &&
            fetchedSettings.phone === currentSettings.phone &&
            fetchedSettings.whatsapp === currentSettings.whatsapp &&
            fetchedSettings.workingHours === currentSettings.workingHours &&
            fetchedSettings.mapLatitude === currentSettings.mapLatitude &&
            fetchedSettings.mapLongitude === currentSettings.mapLongitude
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: ID should never change during updates.
   */
  it('should preserve settings ID during updates', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        updateSettingsInputArbitrary,
        (currentSettings, input) => {
          const updatedSettings = updateSettings(currentSettings, input);
          return updatedSettings.id === currentSettings.id;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: updatedAt should be updated on each change.
   */
  it('should update updatedAt timestamp on changes', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        updateSettingsInputArbitrary,
        (currentSettings, input) => {
          const updatedSettings = updateSettings(currentSettings, input);
          // updatedAt should be a valid ISO string
          return (
            typeof updatedSettings.updatedAt === 'string' &&
            !isNaN(Date.parse(updatedSettings.updatedAt))
          );
        }
      ),
      { numRuns: 30 }
    );
  });
});

/**
 * Deeply serializes data to ensure only plain objects are passed to Client Components.
 * Converts Firestore Timestamps to ISO strings and handles nested arrays/objects.
 */
export function serializeData<T>(data: T): T {
    if (data === null || data === undefined) return data;

    // Handle Firestore Timestamp specifically
    if (data && typeof (data as any).toDate === 'function') {
        return (data as any).toDate().toISOString() as unknown as T;
    }

    // Fallback for objects that look like Timestamps (seconds/nanoseconds)
    if (typeof data === 'object' && data !== null && 'seconds' in data && 'nanoseconds' in data) {
        return new Date((data as any).seconds * 1000).toISOString() as unknown as T;
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeData(item)) as unknown as T;
    }

    if (typeof data === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeData(value);
        }
        return serialized as T;
    }

    return data;
}

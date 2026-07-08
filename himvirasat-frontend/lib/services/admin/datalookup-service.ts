import { API_URL } from "@/lib/constants";

export class DataLookupService {
    /**
     * Fetches all dynamic dialect strings from the database
     */
    static async getAvailableDialects(): Promise<string[]> {
        const response = await fetch(`${API_URL}/datalookup/available-dialects`, {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch available dialects");
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Fetches all functional category strings from the database
     */
    static async getAvailableCategories(): Promise<string[]> {
        const response = await fetch(`${API_URL}/datalookup/available-categories`, {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch available categories");
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Fetches all part of speech grammatical markers from the database
     */
    static async getAvailablePartsOfSpeech(): Promise<string[]> {
        const response = await fetch(`${API_URL}/datalookup/available-pos`, {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch available parts of speech");
        }

        const result = await response.json();
        return result.data;
    }
}

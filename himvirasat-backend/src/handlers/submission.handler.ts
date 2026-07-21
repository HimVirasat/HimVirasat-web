import { RequestHandler } from "express";
import { supabase } from "../services/supabase.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { randomUUID } from "crypto";

const getUserId = (req: AuthenticatedRequest): string | undefined => {
    return req.user?.userId || (req.user as any)?.id;
};

// POST /submissions
export const createSubmissionHandler: RequestHandler = async (req, res): Promise<void> => {
    const startedAt = performance.now();
    const authReq = req as AuthenticatedRequest;
    const contributor_id = getUserId(authReq);

    if (!contributor_id) {
        res.status(401).json({ success: false, error: "Authentication missing." });
        return;
    }

    try {
        // 1. Explicitly destructure EVERY single field sent from frontend
        const {
            dialect_id,
            category_id,
            part_of_speech_id,
            word_devanagari,
            word_latin,
            word_takri,
            ipa,
            meaning,
            meaning_hindi,
            meaning_english,
            example_sentence,
            example_sentence_hindi,
            example_sentence_english,
            example_sentence_latin,
            example_sentence_takri,
            region,
        } = req.body;

        // 2. Validate mandatory fields
        if (!dialect_id || !word_devanagari || (!meaning && !meaning_hindi)) {
            res.status(400).json({
                success: false,
                error: "Missing mandatory fields: dialect_id, word_devanagari, and meaning are required.",
            });
            return;
        }

        // 3. Build the explicit payload object mapping ALL fields
        const contributionData = {
            id: randomUUID(),
            contributor_id,
            dialect_id: Number(dialect_id),
            category_id: category_id ? Number(category_id) : null,
            part_of_speech_id: part_of_speech_id ? Number(part_of_speech_id) : null,
            word_devanagari: word_devanagari.trim(),
            word_latin: word_latin?.trim() || null,
            word_takri: word_takri?.trim() || null,
            ipa: ipa?.trim() || null,
            meaning: (meaning || meaning_hindi || "").trim(),
            meaning_hindi: meaning_hindi?.trim() || null,
            meaning_english: meaning_english?.trim() || null,
            example_sentence: example_sentence?.trim() || null,
            example_sentence_hindi: example_sentence_hindi?.trim() || null,
            example_sentence_english: example_sentence_english?.trim() || null,
            example_sentence_latin: example_sentence_latin?.trim() || null,
            example_sentence_takri: example_sentence_takri?.trim() || null,
            region: region?.trim() || null,
            status: "under_review",
        };

        // 4. Insert new submission row directly into 'contributions'
        const { data: contribution, error: insertError } = await supabase
            .from("contributions")
            .insert([contributionData])
            .select()
            .single();

        if (insertError) {
            logger.error("Failed to insert contribution submission", insertError);
            res.status(400).json({ success: false, error: insertError.message });
            return;
        }

        // 5. Create initial entry in contribution_history
        const { error: historyError } = await supabase.from("contribution_history").insert([
            {
                contribution_id: contribution.id,
                actor_id: contributor_id,
                type: "submitted",
                message: "New vocabulary entry submitted for review.",
            },
        ]);

        if (historyError) {
            logger.warn("Failed to write initial contribution history record", historyError);
        }

        res.status(201).json({
            success: true,
            message: "Vocabulary entry submitted successfully.",
            data: contribution,
        });
    } catch (error: any) {
        logger.error("createSubmissionHandler failed", error, {
            durationMs: Number((performance.now() - startedAt).toFixed(2)),
        });
        res.status(500).json({ success: false, error: error.message });
    }
};
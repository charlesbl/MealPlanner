import { AuthRequest } from "@mealplanner/shared-back";
import { Response } from "express";
import { AppDataSource } from "../../data-source.js";
import { MealEntity } from "./meal.entity.js";
import { UserSelectionEntity } from "./userSelection.entity.js";

export function userSelectionControllerFactory() {
    const selectionRepo = AppDataSource.getRepository(UserSelectionEntity);
    const mealRepo = AppDataSource.getRepository(MealEntity);
    return {
        getAll: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            const selections = await selectionRepo.find({
                where: { user: { id: userId } },
                relations: ["meal"],
                order: { order: "ASC" },
            });
            res.json(selections);
        },
        add: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            const { mealId, order } = req.body;
            if (!userId || !mealId)
                return res.status(400).json({ error: "Missing data" });

            const meal = await mealRepo.findOne({
                where: { id: mealId, user: { id: userId } },
            });
            const isMealInDeck = meal !== null;
            if (!isMealInDeck)
                return res.status(404).json({ error: "Meal not in your deck" });

            const selection = selectionRepo.create({
                user: { id: userId },
                meal,
                order,
            });
            await selectionRepo.save(selection);
            res.status(201).json(selection);
        },
        remove: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            const { mealId } = req.body;
            if (!userId || !mealId)
                return res.status(400).json({ error: "Missing data" });
            const selection = await selectionRepo.findOne({
                where: { user: { id: userId }, meal: { id: mealId } },
            });
            if (!selection)
                return res.status(404).json({ error: "Not in selection" });
            await selectionRepo.remove(selection);
            res.status(204).send();
        },
    };
}

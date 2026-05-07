/*
  Warnings:

  - You are about to drop the `physics_models` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `research_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `simulation_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `simulations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "research_logs" DROP CONSTRAINT "research_logs_simulation_id_fkey";

-- DropForeignKey
ALTER TABLE "research_logs" DROP CONSTRAINT "research_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "simulation_results" DROP CONSTRAINT "simulation_results_simulation_id_fkey";

-- DropForeignKey
ALTER TABLE "simulations" DROP CONSTRAINT "simulations_physics_model_id_fkey";

-- DropForeignKey
ALTER TABLE "simulations" DROP CONSTRAINT "simulations_user_id_fkey";

-- DropTable
DROP TABLE "physics_models";

-- DropTable
DROP TABLE "research_logs";

-- DropTable
DROP TABLE "simulation_results";

-- DropTable
DROP TABLE "simulations";

-- DropEnum
DROP TYPE "SimulationStatus";

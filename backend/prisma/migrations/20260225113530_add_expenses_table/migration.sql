-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physics_models" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "equation" TEXT,
    "parameters" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physics_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "physics_model_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB NOT NULL,
    "status" "SimulationStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_results" (
    "id" UUID NOT NULL,
    "simulation_id" UUID NOT NULL,
    "output_data" JSONB NOT NULL,
    "metrics" JSONB,
    "visualization_data" JSONB,
    "computation_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "simulation_id" UUID,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_family_id_idx" ON "expenses"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "physics_models_name_key" ON "physics_models"("name");

-- CreateIndex
CREATE INDEX "physics_models_active_idx" ON "physics_models"("active");

-- CreateIndex
CREATE INDEX "physics_models_category_idx" ON "physics_models"("category");

-- CreateIndex
CREATE INDEX "simulations_user_id_idx" ON "simulations"("user_id");

-- CreateIndex
CREATE INDEX "simulations_physics_model_id_idx" ON "simulations"("physics_model_id");

-- CreateIndex
CREATE INDEX "simulations_status_idx" ON "simulations"("status");

-- CreateIndex
CREATE INDEX "simulations_created_at_idx" ON "simulations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_results_simulation_id_key" ON "simulation_results"("simulation_id");

-- CreateIndex
CREATE INDEX "simulation_results_simulation_id_idx" ON "simulation_results"("simulation_id");

-- CreateIndex
CREATE INDEX "research_logs_user_id_idx" ON "research_logs"("user_id");

-- CreateIndex
CREATE INDEX "research_logs_simulation_id_idx" ON "research_logs"("simulation_id");

-- CreateIndex
CREATE INDEX "research_logs_created_at_idx" ON "research_logs"("created_at");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_physics_model_id_fkey" FOREIGN KEY ("physics_model_id") REFERENCES "physics_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_results" ADD CONSTRAINT "simulation_results_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_logs" ADD CONSTRAINT "research_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_logs" ADD CONSTRAINT "research_logs_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

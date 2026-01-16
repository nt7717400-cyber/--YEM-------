<?php
/**
 * Base Service Class
 * Foundation for all service classes
 * Provides common functionality and database access
 */

abstract class BaseService {
    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Begin database transaction
     */
    protected function beginTransaction(): void {
        $this->db->beginTransaction();
    }

    /**
     * Commit database transaction
     */
    protected function commit(): void {
        $this->db->commit();
    }

    /**
     * Rollback database transaction
     */
    protected function rollback(): void {
        $this->db->rollBack();
    }

    /**
     * Convert camelCase to snake_case
     */
    protected function camelToSnake(string $input): string {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
    }

    /**
     * Convert snake_case to camelCase
     */
    protected function snakeToCamel(string $input): string {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $input))));
    }
}

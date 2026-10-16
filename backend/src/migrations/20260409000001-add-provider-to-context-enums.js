/**
 * Migration: Adicionar 'provider' aos ENUMs de contexto
 * 
 * Adiciona o valor 'provider' aos ENUMs:
 * - enum_context_sessions_user_type
 * - enum_context_sessions_context_type
 * - enum_context_audit_logs_user_type
 * - enum_context_audit_logs_from_context_type
 * - enum_context_audit_logs_to_context_type
 */

export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Adicionando "provider" aos ENUMs de contexto...');

    // 1. Adicionar 'provider' ao ENUM user_type de context_sessions
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_context_sessions_user_type ADD VALUE IF NOT EXISTS 'provider';`,
      { transaction }
    );
    console.log('✅ Adicionado "provider" a enum_context_sessions_user_type');

    // 2. Adicionar 'provider' ao ENUM context_type de context_sessions
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_context_sessions_context_type ADD VALUE IF NOT EXISTS 'provider';`,
      { transaction }
    );
    console.log('✅ Adicionado "provider" a enum_context_sessions_context_type');

    // 3. Adicionar 'provider' ao ENUM user_type de context_audit_logs
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_context_audit_logs_user_type ADD VALUE IF NOT EXISTS 'provider';`,
      { transaction }
    );
    console.log('✅ Adicionado "provider" a enum_context_audit_logs_user_type');

    // 4. Adicionar 'provider' ao ENUM from_context_type de context_audit_logs
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_context_audit_logs_from_context_type ADD VALUE IF NOT EXISTS 'provider';`,
      { transaction }
    );
    console.log('✅ Adicionado "provider" a enum_context_audit_logs_from_context_type');

    // 5. Adicionar 'provider' ao ENUM to_context_type de context_audit_logs
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_context_audit_logs_to_context_type ADD VALUE IF NOT EXISTS 'provider';`,
      { transaction }
    );
    console.log('✅ Adicionado "provider" a enum_context_audit_logs_to_context_type');

    await transaction.commit();
    console.log('✅ Migration concluída com sucesso!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro na migration:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  // Nota: PostgreSQL não permite remover valores de ENUMs facilmente
  // Esta migration é irreversível sem recriar os ENUMs
  console.log('⚠️  Esta migration não pode ser revertida automaticamente.');
  console.log('⚠️  Para reverter, seria necessário recriar os ENUMs sem o valor "provider".');
}

import logger from '../../utils/logger.js';

export class SkillMemory {
  constructor() {
    this.skills = new Map();
  }

  learnSkill(skillName, skillData) {
    const skill = {
      name: skillName,
      data: skillData,
      proficiency: 0,
      usageCount: 0,
      successCount: 0,
      lastUsed: Date.now(),
      learned: Date.now()
    };

    this.skills.set(skillName, skill);
    logger.info(`Skill learned: ${skillName}`);

    return skill;
  }

  useSkill(skillName, success = true) {
    const skill = this.skills.get(skillName);

    if (!skill) {
      logger.warn(`Skill not found: ${skillName}`);
      return null;
    }

    skill.usageCount++;
    if (success) {
      skill.successCount++;
    }

    // Update proficiency (0-100)
    skill.proficiency = Math.min(100, 
      (skill.successCount / skill.usageCount) * 100
    );

    skill.lastUsed = Date.now();

    logger.info(`Skill used: ${skillName} (proficiency: ${skill.proficiency.toFixed(1)}%)`);

    return skill;
  }

  getSkill(skillName) {
    return this.skills.get(skillName);
  }

  getAllSkills() {
    return Array.from(this.skills.values());
  }

  getMasteredSkills(threshold = 80) {
    return this.getAllSkills()
      .filter(skill => skill.proficiency >= threshold)
      .sort((a, b) => b.proficiency - a.proficiency);
  }

  getRecentSkills(limit = 5) {
    return this.getAllSkills()
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit);
  }

  improveSkill(skillName, improvement) {
    const skill = this.skills.get(skillName);

    if (!skill) return null;

    skill.proficiency = Math.min(100, skill.proficiency + improvement);
    logger.info(`Skill improved: ${skillName} (+${improvement})`);

    return skill;
  }

  forgetSkill(skillName) {
    const deleted = this.skills.delete(skillName);
    if (deleted) {
      logger.info(`Skill forgotten: ${skillName}`);
    }
    return deleted;
  }

  getStats() {
    const skills = this.getAllSkills();

    return {
      totalSkills: skills.length,
      masteredSkills: skills.filter(s => s.proficiency >= 80).length,
      averageProficiency: skills.reduce((sum, s) => 
        sum + s.proficiency, 0) / skills.length || 0,
      totalUsage: skills.reduce((sum, s) => sum + s.usageCount, 0)
    };
  }

  export() {
    return Array.from(this.skills.entries());
  }

  import(skillsData) {
    this.skills = new Map(skillsData);
    logger.info(`Imported ${skillsData.length} skills`);
  }
}

export default new SkillMemory();

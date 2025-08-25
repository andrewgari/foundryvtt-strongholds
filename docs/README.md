# FoundryVTT Development Documentation

This directory contains comprehensive documentation for AI agents and developers working with FoundryVTT.

## 📚 **Documentation Files**

### **[FOUNDRY_AI_AGENT_GUIDE.md](./FOUNDRY_AI_AGENT_GUIDE.md)**

**Comprehensive development guide for AI agents**

- Complete FoundryVTT API best practices
- ApplicationV2 vs Legacy Application patterns
- Security and performance guidelines
- Common anti-patterns to avoid
- System integration patterns
- Testing and debugging approaches

### **[FOUNDRY_QUICK_REFERENCE.md](./FOUNDRY_QUICK_REFERENCE.md)**

**Quick lookup reference for common patterns**

- Essential API calls and patterns
- Hook system quick reference
- Settings management
- Template helpers
- Common gotchas and solutions

### **[MODULE_PATTERNS.md](./MODULE_PATTERNS.md)**

**Real-world patterns from this Strongholds module**

- File structure and organization
- Data management patterns
- UI integration examples
- Event handling best practices
- Styling with Foundry CSS variables

### **[DOCUMENT_BIBLE.md](./DOCUMENT_BIBLE.md)**

**Authoritative project “bible” with objectives, vision, and architecture overview**

## 🎯 **How to Use This Documentation**

### **For AI Agents**

1. **Start with** `FOUNDRY_AI_AGENT_GUIDE.md` for comprehensive understanding
2. **Reference** `FOUNDRY_QUICK_REFERENCE.md` for quick lookups during development
3. **Study** `MODULE_PATTERNS.md` to see real-world implementation patterns

### **For Developers**

1. **Read** the AI Agent Guide to understand best practices
2. **Use** the Quick Reference for common code patterns
3. **Examine** this module's code alongside the Module Patterns doc

### **For Code Reviews**

- Check against the **anti-patterns** section in the AI Agent Guide
- Verify **API visibility** (@public vs @private) usage
- Ensure **modern patterns** (ApplicationV2 when possible)
- Validate **security practices** and permission checks

## 🔗 **External Resources**

- **Official API**: https://foundryvtt.com/api/
- **Community Wiki**: https://foundryvtt.wiki/en/development/api
- **Discord**: https://discord.gg/foundryvtt (#dev-support)
- **Module Template**: https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template

## ⚡ **Quick Development Checklist**

Before releasing any FoundryVTT module:

- [ ] **API Usage**: Only using @public methods
- [ ] **Compatibility**: Tested on target Foundry versions
- [ ] **Permissions**: Proper GM/Player permission checks
- [ ] **Error Handling**: Graceful failure with user feedback
- [ ] **Performance**: Efficient data processing
- [ ] **Security**: No XSS vulnerabilities, input validation
- [ ] **Localization**: Ready for i18n (even if not implemented)
- [ ] **Documentation**: Clear README and inline comments

## 🔄 **Keeping Documentation Updated**

This documentation should be updated when:

- FoundryVTT releases new API versions
- New best practices are established
- Common patterns change
- New anti-patterns are discovered

---

_This documentation is maintained to help developers create high-quality FoundryVTT modules following current best practices._

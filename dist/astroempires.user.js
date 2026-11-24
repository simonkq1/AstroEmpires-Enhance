// ==UserScript==
// @name         Astro Empires Enhance
// @namespace    astroempires-tools
// @version      0.9.0
// @author       simonkq1
// @description  在 Borealis 提供戰報 BBCode 轉換與分析、艦隊資料複製、AEBits 匯入與抵達時間預測
// @downloadURL  https://raw.githubusercontent.com/simonkq1/AstroEmpires-Enhance/master/dist/astroempires.user.js
// @updateURL    https://raw.githubusercontent.com/simonkq1/AstroEmpires-Enhance/master/dist/astroempires.user.js
// @match        https://borealis.astroempires.com/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.5.45/dist/vue.runtime.global.prod.js
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function(vue) {
	"use strict";
	var en = {
		settings: "Settings",
		display: "Display",
		language: "Language",
		save: "Save",
		cancel: "Cancel",
		saveFailed: "Settings could not be saved. The selected language is applied for this page.",
		menu: "Features",
		openMenu: "Open feature menu",
		closeMenu: "Close feature menu",
		help: "Help",
		helpTitle: "Features and usage",
		helpIntro: "These features are available on Borealis. Open the bottom-right arrow to access BBCode analysis, Settings and Help. Close this window or press Esc to return to the menu.",
		helpReportPages: "On messages.aspx, board.aspx and combat.aspx, find a battle report and click “Copy battle report BBCode” below it. Each button copies only its own report, keeping the original language.",
		helpReportCopy: "If clipboard access fails, select and copy the text in the fallback box manually. Use this BBCode for analysis instead of copying the game table directly.",
		helpAnalyzePaste: "Open “Analyze BBCode” from the feature menu, paste the copied BBCode, then click “Analyze”. Simplified Chinese and English reports are supported. Keep the side headings and all six columns of each [code] unit table.",
		helpAnalyzeResults: "Results show confirmed technology levels for each side and explain fields that need confirmation. A complete report helps identify bonuses. Editing the input clears the old result; click “Analyze” again. Closing the panel keeps your input and results until you leave the page.",
		helpImport: "After a successful analysis, click “Import into AEBits Battle Calculator”. A new tab opens with initial forces, confirmed technologies and explicit bonuses. Fractional forces and units destroyed in battle are included. Only the available side is imported for a one-sided report.",
		helpImportErrors: "Check unresolved technologies manually in AEBits. Unknown units, invalid initial quantities or incomplete unit rows block import; correct the reported issue and analyze again. The calculator language follows your script language.",
		helpFleetCombat: "Fleet details and combat pages",
		helpFleet: "On fleet.aspx?fleet=<fleet ID>, click “Copy fleet data” below the ship table and choose Simplified Chinese or English. Each line contains a unit name and quantity separated by a Tab. For AEBits, choose Attacker or Defender; fleet details import ships only, so enter technologies in the calculator.",
		helpCombat: "On combat.aspx, “Copy fleet data” lets you choose the side and output language. “AEBits Battle Calculator” imports both sides’ initial forces, including listed defenses, and confirmed technologies and bonuses. Check any confirmation notices below the toolbar.",
		helpArrival: "On fleet.aspx?fleet=<fleet ID>&view=move, choose a destination and set ships and speed. Once the game calculates travel time, “Estimated arrival” below the travel table updates every second as if you departed now.",
		helpClocks: "Server time uses the game’s header clock (GMT+1); it shows “Unavailable” if that clock cannot be read. Local time independently uses your device’s current clock and time zone. An invalid travel time clears both estimates. These estimates do not launch the fleet.",
		helpLanguageFirst: "On first use, select 简体中文 or English and save. “Later” or Esc uses English for this page and asks again on the next page load.",
		helpLanguageSettings: "Open “Settings” from the feature menu, choose a language under “Display” and save. The interface updates immediately while keeping your report and results. “Cancel” discards the selection. Fleet copy language is chosen separately.",
		analyzeBbcode: "Analyze BBCode",
		analysisTitle: "BBCode Battle Report Analysis",
		closeAnalysis: "Close battle report analysis",
		close: "Close",
		reportInput: "Battle report BBCode",
		analyze: "Analyze",
		reportPlaceholder: "Paste BBCode containing a complete report or attacker and defender unit tables",
		pasteFirst: "Please paste battle report BBCode first.",
		noRecognized: "No recognized units. Paste BBCode with side headings and [code] unit tables. {details}",
		noUnits: "No recognized unit data.",
		noLevels: "No technology levels could be confirmed.",
		pending: "Needs confirmation",
		unlisted: "Unlisted technologies have no usable data.",
		importCalculator: "Import into AEBits Battle Calculator",
		calculator: "AEBits Battle Calculator",
		attacker: "Attacker",
		defender: "Defender",
		chinese: "Simplified Chinese",
		english: "English",
		copyFleet: "Copy fleet data",
		fleetData: "Fleet data",
		copyChoice: "{side} {language}",
		copiedFleet: "Copied {choice} fleet data.",
		clipboardFleet: "Clipboard access failed. Copy the fleet data below manually.",
		unknownImport: "Cannot import unrecognized units: {names}.",
		copyReport: "Copy battle report BBCode",
		copiedReport: "Battle report BBCode copied.",
		clipboardReport: "Clipboard access failed. Copy the BBCode below manually.",
		incompleteReport: "The battle report is incomplete and cannot be converted.",
		estimatedArrival: "Estimated arrival",
		serverTime: "Server time",
		localTime: "Local time",
		unavailable: "Unavailable",
		waitingTravel: "Waiting for the game to calculate travel time.",
		damagedDefense: "Base defenses are damaged or their initial condition is unknown, and no usable ship data is available.",
		missingModifier: "The report does not specify this bonus.",
		missingObservation: "No usable observation with a nonzero base value is available.",
		missingAttackBonus: "Command Center or commander bonuses are missing. Provide the complete report.",
		conflictingValues: "Values do not match an integer technology level or conflict with other units.",
		manualConfirm: "Please confirm these fields manually in AEBits: {sides}.",
		sideFields: "{side} ({fields})",
		fieldReason: "{field} — {reason}",
		incompleteRow: "Unit \"{name}\" has an incomplete unit row.",
		invalidQuantity: "Unit \"{name}\" has an invalid initial quantity.",
		unnamedUnit: "Unnamed unit",
		unknownUnit: "Unit \"{name}\" is unrecognized and its statistics were excluded.",
		incompleteStats: "Attack, armour or shield data for \"{name}\" is incomplete.",
		sideIssue: "{side}: {issue}",
		importBlocked: "Cannot import. {issues}",
		noImportUnits: "No initial units to import.",
		codeNested: "The BBCode [code] blocks are nested or improperly closed.",
		codeMissingStart: "A BBCode [code] opening tag is missing.",
		codeMissingEnd: "A BBCode [code] closing tag is missing.",
		ARM: "Armour",
		LAS: "Laser",
		MIS: "Missiles",
		PLA: "Plasma",
		SLD: "Shielding",
		ION: "Ion",
		PHO: "Photon",
		DIS: "Disruptor",
		CC: "Command Centers",
		DfC: "Defense Mastery",
		TaC: "Tactical Mastery"
	};
	var chinese = {
		settings: "设置",
		display: "显示",
		language: "语言",
		save: "保存",
		cancel: "取消",
		saveFailed: "无法保存设置，所选语言已应用于本页。",
		menu: "功能菜单",
		openMenu: "打开功能菜单",
		closeMenu: "收起功能菜单",
		help: "说明",
		helpTitle: "功能与使用说明",
		helpIntro: "以下功能适用于 Borealis。点击右下角箭头，可打开分析 BBCode、设置和说明。关闭本窗口或按 Esc 可返回功能菜单。",
		helpReportPages: "在消息页 messages.aspx、公会面板 board.aspx 或战斗页 combat.aspx，找到战报并点击下方的“复制战报 BBCode”。每个按钮只复制对应的战报，保留原文语言。",
		helpReportCopy: "如果无法访问剪贴板，请选中备用文本框中的内容并手动复制。分析时请使用这份 BBCode，避免直接复制游戏表格造成格式缺失。",
		helpAnalyzePaste: "从功能菜单打开“分析 BBCode”，粘贴复制的内容后点击“分析”。支持简体中文和英文战报。请保留攻守方标题，以及 [code] 兵力表格的全部六栏。",
		helpAnalyzeResults: "结果分别列出攻守方已确认的科技等级，以及待确认字段的原因。完整战报有助于识别加成。修改输入后会清除旧结果，请再次点击“分析”。关闭面板会保留输入和结果，直到离开页面。",
		helpImport: "分析成功后，点击“导入 AEBits 战斗模拟器”，即可在新标签页带入初始兵力、已确认科技与明列加成。小数兵力及战后全灭单位也会保留。仅有一方资料时只导入该方。",
		helpImportErrors: "请在 AEBits 手动确认尚未确定的科技。遇到未识别单位、初始数量无效或兵力列不完整时，会停止导入；请按提示修正后重新分析。模拟器语言跟随脚本语言设置。",
		helpFleetCombat: "舰队详情与战斗页",
		helpFleet: "在 fleet.aspx?fleet=<舰队编号> 的舰船表下方，点击“复制舰队资料”并选择简体中文或英文。每行包含舰种与数量，以 Tab 分隔。打开 AEBits 时可选择攻方或守方；舰队详情只导入舰船，科技需在模拟器中填写。",
		helpCombat: "在 combat.aspx，“复制舰队资料”可选择攻守方与输出语言。“AEBits 战斗计算器”会导入双方初始兵力、列出的防御设施，以及已确认的科技和加成。请检查工具栏下方的待确认提示。",
		helpArrival: "在 fleet.aspx?fleet=<舰队编号>&view=move，选择目的地并设置舰船和速度。游戏算出航行时间后，航行表下方的“预计到达”会每秒更新，表示如果现在出发的抵达时间。",
		helpClocks: "服务器时间从游戏页首时钟（GMT+1）起算，无法读取时显示“无法取得”。本地时间独立使用设备当前时钟与时区计算。航行时间无效时会清除两项预测。预测功能不会派遣舰队。",
		helpLanguageFirst: "首次使用时，选择简体中文或 English 并保存。“稍后”或 Esc 会在本页使用英文，下次载入页面时再次询问。",
		helpLanguageSettings: "从功能菜单打开“设置”，在“显示”中选择语言并保存。界面立即更新，战报输入和结果会保留。“取消”会放弃本次选择。复制舰队资料的输出语言可独立选择。",
		analyzeBbcode: "分析 BBCode",
		analysisTitle: "BBCode 战报分析",
		closeAnalysis: "关闭战报分析",
		close: "关闭",
		reportInput: "战报 BBCode",
		analyze: "分析",
		reportPlaceholder: "粘贴包含完整战报或攻守方兵力表格的 BBCode",
		pasteFirst: "请先粘贴战报 BBCode。",
		noRecognized: "没有可识别的单位，请粘贴包含攻守方标题与 [code] 兵力表格的 BBCode。{details}",
		noUnits: "没有可识别的单位资料。",
		noLevels: "目前没有可确认的科技等级。",
		pending: "待确认",
		unlisted: "未列出的科技缺少可用资料。",
		importCalculator: "导入 AEBits 战斗模拟器",
		calculator: "AEBits 战斗计算器",
		attacker: "攻方",
		defender: "守方",
		chinese: "简体中文",
		english: "英文",
		copyFleet: "复制舰队资料",
		fleetData: "舰队资料",
		copyChoice: "{side} {language}",
		copiedFleet: "已复制{choice}舰队资料。",
		clipboardFleet: "无法访问剪贴板，请手动复制下方的舰队资料。",
		unknownImport: "无法导入，未识别的单位为 {names}。",
		copyReport: "复制战报 BBCode",
		copiedReport: "已复制战报 BBCode。",
		clipboardReport: "无法访问剪贴板，请手动复制下方的 BBCode。",
		incompleteReport: "战报资料不完整，无法转换。",
		estimatedArrival: "预计到达",
		serverTime: "服务器时间",
		localTime: "本地时间",
		unavailable: "无法取得",
		waitingTravel: "等待游戏计算航行时间。",
		damagedDefense: "基地防御受损或初始防御状态不明，缺少可用的舰船数值。",
		missingModifier: "战报缺少此项加成资料。",
		missingObservation: "缺少可用的非零基础数值或有效观测。",
		missingAttackBonus: "缺少指挥中心或指挥官加成资料，请提供完整战报。",
		conflictingValues: "数值无法回算为整数科技等级，或与其他单位的数值矛盾。",
		manualConfirm: "请在 AEBits 手动确认这些字段：{sides}。",
		sideFields: "{side}（{fields}）",
		fieldReason: "{field} — {reason}",
		incompleteRow: "单位「{name}」的兵力列不完整。",
		invalidQuantity: "单位「{name}」的初始数量无效。",
		unnamedUnit: "未命名单位",
		unknownUnit: "未识别单位「{name}」，其数值未用于推算。",
		incompleteStats: "单位「{name}」的攻击、装甲或护盾资料不完整。",
		sideIssue: "{side}：{issue}",
		importBlocked: "无法导入，{issues}",
		noImportUnits: "没有可导入的初始兵力。",
		codeNested: "BBCode 的 [code] 区块嵌套或未正确结束。",
		codeMissingStart: "BBCode 的 [code] 区块缺少起始标签。",
		codeMissingEnd: "BBCode 的 [code] 区块缺少结束标签。",
		ARM: "装甲",
		LAS: "激光",
		MIS: "导弹",
		PLA: "等离子电浆",
		SLD: "护盾",
		ION: "离子",
		PHO: "光子",
		DIS: "物质裂解",
		CC: "指挥中心",
		DfC: "防御精通",
		TaC: "战术精通"
	};
	var language = (0, vue.ref)("en");
	function msg(key, params) {
		return {
			key,
			params
		};
	}
	function t(value, locale = language.value) {
		if (value === null) return "";
		const message = typeof value === "string" ? msg(value) : value;
		const template = (locale === "zh-CN" ? chinese : en)[message.key];
		const format = (param) => {
			if (Array.isArray(param)) return param.map(format).join(locale === "zh-CN" ? "、" : ", ");
			return typeof param === "object" ? t(param, locale) : String(param);
		};
		return template.replace(/\{(\w+)\}/g, (_, key) => format(message.params?.[key] ?? ""));
	}
	var fieldLabels = {
		ARM: msg("ARM"),
		LAS: msg("LAS"),
		MIS: msg("MIS"),
		PLA: msg("PLA"),
		SLD: msg("SLD"),
		ION: msg("ION"),
		PHO: msg("PHO"),
		DIS: msg("DIS"),
		CC: msg("CC"),
		DfC: msg("DfC"),
		TaC: msg("TaC")
	};
	var shipStats = {
		FT: [
			"LAS",
			2,
			2,
			0
		],
		BO: [
			"MIS",
			5,
			2,
			0
		],
		HB: [
			"PLA",
			10,
			5,
			0
		],
		IB: [
			"ION",
			12,
			5,
			1
		],
		CV: [
			"LAS",
			4,
			5,
			0
		],
		RC: [
			"LAS",
			2,
			2,
			0
		],
		DE: [
			"PLA",
			10,
			8,
			0
		],
		FR: [
			"MIS",
			12,
			12,
			0
		],
		IF: [
			"ION",
			14,
			12,
			1
		],
		SS: [
			"LAS",
			1,
			2,
			0
		],
		OS: [
			"LAS",
			2,
			4,
			0
		],
		CR: [
			"PLA",
			24,
			24,
			2
		],
		CA: [
			"MIS",
			12,
			24,
			2
		],
		HC: [
			"PLA",
			48,
			48,
			4
		],
		BS: [
			"ION",
			160,
			128,
			12
		],
		FC: [
			"ION",
			64,
			96,
			10
		],
		DN: [
			"PHO",
			756,
			512,
			20
		],
		TI: [
			"DIS",
			3500,
			2048,
			30
		],
		LE: [
			"PHO",
			1e4,
			6600,
			40
		],
		DS: [
			"DIS",
			28e3,
			15e3,
			60
		]
	};
	var defenseStats = {
		BA: [
			"LAS",
			4,
			4,
			0
		],
		LT: [
			"LAS",
			8,
			8,
			0
		],
		MT: [
			"MIS",
			16,
			16,
			0
		],
		PT: [
			"PLA",
			24,
			24,
			0
		],
		IT: [
			"ION",
			40,
			40,
			2
		],
		OT: [
			"PHO",
			80,
			80,
			6
		],
		DT: [
			"DIS",
			320,
			320,
			8
		],
		FS: [
			"ION",
			2,
			640,
			16
		],
		PS: [
			"ION",
			4,
			2e3,
			20
		],
		PR: [
			"PHO",
			1600,
			1e3,
			12
		]
	};
	function inferCombatTechnology(observations, modifiers) {
		const levels = {};
		const candidates = new Map();
		const relevant = new Set();
		const reasons = {};
		const codes = new Set(observations.map(({ code }) => code));
		const capitalPercent = codes.has("DS") ? 110 : codes.has("LE") ? 105 : 100;
		const fleetAttack = modifiers.CC === null || modifiers.TaC === null ? null : capitalPercent * (100 + 5 * modifiers.CC + modifiers.TaC);
		const defensePower = modifiers.DfC === null ? null : 100 * (100 + modifiers.DfC);
		for (const { code, attack, armour, shield } of observations) {
			if (!code) continue;
			const defense = defenseStats[code];
			const base = defense ?? shipStats[code];
			if (!base) continue;
			const [weapon, baseAttack, baseArmour, baseShield] = base;
			relevant.add(weapon);
			relevant.add("ARM");
			relevant.add("SLD");
			if (defense) {
				relevant.add("DfC");
				if (!modifiers.fullDefenses) {
					for (const key of [
						weapon,
						"ARM",
						"SLD"
					]) reasons[key] = msg("damagedDefense");
					continue;
				}
			} else {
				relevant.add("CC");
				relevant.add("TaC");
			}
			observe(weapon, attack, baseAttack, defense ? defensePower : fleetAttack);
			observe("ARM", armour, baseArmour, defense ? defensePower : 100 * capitalPercent);
			observe("SLD", shield, baseShield, 1e4);
		}
		for (const [key, level] of candidates) if (level !== null) levels[key] = level;
		for (const key of [
			"CC",
			"DfC",
			"TaC"
		]) {
			const level = modifiers[key];
			if (level !== null && level > 0) levels[key] = level;
		}
		const unresolved = [...relevant].filter((key) => key === "CC" || key === "DfC" || key === "TaC" ? modifiers[key] === null : levels[key] === void 0);
		for (const key of unresolved) reasons[key] ??= key === "CC" || key === "DfC" || key === "TaC" ? msg("missingModifier") : msg("missingObservation");
		return {
			levels,
			unresolved,
			reasons
		};
		function observe(key, displayed, base, bonus) {
			if (bonus === null) reasons[key] = msg("missingAttackBonus");
			if (displayed === void 0 || !base || bonus === null) return;
			const scaledBase = base * bonus;
			const level = Math.round((displayed * 1e4 / scaledBase - 1) * 20);
			const scaledResult = scaledBase * (100 + 5 * level);
			const matches = level >= 0 && Number.isSafeInteger(scaledResult) && Math.round(scaledResult / 1e4) === Math.round(displayed * 100);
			candidates.set(key, matches && (!candidates.has(key) || candidates.get(key) === level) ? level : null);
			if (candidates.get(key) === null) reasons[key] = msg("conflictingValues");
		}
	}
	function readCombatTechnologies(report, attacker, defender) {
		const modifiers = readModifiers(report);
		const results = {
			aT: inferCombatTechnology(attacker.map(readObservation), modifiers.aT),
			dT: inferCombatTechnology(defender.map(readObservation), modifiers.dT)
		};
		const pending = [];
		for (const [key, side] of [["aT", "attacker"], ["dT", "defender"]]) {
			const labels = results[key].unresolved.map((field) => fieldLabels[field]);
			if (labels.length) pending.push(msg("sideFields", {
				side: msg(side),
				fields: labels
			}));
		}
		return {
			technologies: {
				aT: results.aT.levels,
				dT: results.dT.levels
			},
			notice: pending.length ? msg("manualConfirm", { sides: pending }) : null
		};
	}
	function readObservation({ unit, row }) {
		return {
			code: unit.code,
			attack: readNumber(row.cells[3]?.textContent),
			armour: readNumber(row.cells[4]?.textContent),
			shield: readNumber(row.cells[5]?.textContent)
		};
	}
	function readModifiers(report) {
		const unknown = {
			CC: null,
			TaC: null,
			DfC: null,
			fullDefenses: false
		};
		const sides = {
			aT: { ...unknown },
			dT: { ...unknown }
		};
		let side;
		for (const row of report?.rows ?? []) {
			const [keyCell, valueCell] = row.cells;
			const label = keyCell?.textContent.trim().toLowerCase();
			if (row.classList.contains("battle-report_subtitle")) {
				side = label === "attack force" || label === "攻击舰队" ? sides.aT : label === "defensive force" || label === "防御舰队" ? sides.dT : void 0;
				if (side) Object.assign(side, {
					CC: 0,
					TaC: 0,
					DfC: 0
				});
			}
			if (!side || !valueCell) continue;
			const value = valueCell.textContent.trim();
			switch (label) {
				case "command centers":
				case "指挥中心":
					side.CC = readLevel(value);
					break;
				case "commander":
				case "指挥官":
					Object.assign(side, readCommander(value));
					break;
				case "start defenses":
				case "初始防御": side.fullDefenses = readNumber(value.replace(/[%％]$/, "")) === 100;
			}
		}
		return sides;
	}
	function readCommander(value) {
		if (/^(?:[-–—]|none|无|無)?$/i.test(value)) return {
			DfC: 0,
			TaC: 0
		};
		const match = value.match(/(?:^|[(（]\s*)([^()（）]+?)\s*(\d+)\s*[级級]?\s*[)）]?$/);
		const level = match ? readLevel(match[2]) : null;
		if (level !== null && match) {
			const kind = match[1].trim().toLowerCase();
			if (/^(?:defense|防御精通|防禦精通)$/.test(kind)) return {
				DfC: level,
				TaC: 0
			};
			if (/^(?:tactical|战术精通|戰術精通)$/.test(kind)) return {
				DfC: 0,
				TaC: level
			};
			if (/^(?:construction|research|production|logistics|建造精通|研究精通|生产精通|后勤精通)$/.test(kind)) return {
				DfC: 0,
				TaC: 0
			};
		}
		return {
			DfC: null,
			TaC: null
		};
	}
	function readLevel(value) {
		const level = readNumber(value);
		return level !== void 0 && Number.isSafeInteger(level) ? level : null;
	}
	function readNumber(text) {
		const value = text?.trim() ?? "";
		if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value)) return;
		const number = Number(value.replaceAll(",", ""));
		return Number.isFinite(number) ? number : void 0;
	}
	var ships = [
		[
			"Fighters",
			"战斗机",
			"FT"
		],
		[
			"Bombers",
			"轰炸机",
			"BO"
		],
		[
			"Heavy Bombers",
			"重型轰炸机",
			"HB"
		],
		[
			"Ion Bombers",
			"离子轰炸机",
			"IB"
		],
		[
			"Corvette",
			"炮艇",
			"CV"
		],
		[
			"Recycler",
			"回收船",
			"RC"
		],
		[
			"Destroyer",
			"驱逐舰",
			"DE"
		],
		[
			"Frigate",
			"导弹驱逐舰",
			"FR"
		],
		[
			"Ion Frigate",
			"离子驱逐舰",
			"IF"
		],
		[
			"Scout Ship",
			"侦察机",
			"SS"
		],
		[
			"Outpost Ship",
			"殖民船",
			"OS"
		],
		[
			"Cruiser",
			"巡洋舰",
			"CR"
		],
		[
			"Carrier",
			"护航母舰",
			"CA"
		],
		[
			"Heavy Cruiser",
			"重型巡洋舰",
			"HC"
		],
		[
			"Battleship",
			"战列舰",
			"BS"
		],
		[
			"Fleet Carrier",
			"舰队级母舰",
			"FC"
		],
		[
			"Dreadnought",
			"无畏舰",
			"DN"
		],
		[
			"Titan",
			"泰坦巨舰",
			"TI"
		],
		[
			"Leviathan",
			"利维坦旗舰",
			"LE"
		],
		[
			"Death Star",
			"死星",
			"DS"
		]
	];
	var shipsAndDefenses = [
		...ships,
		[
			"Barracks",
			"基础炮塔",
			"BA"
		],
		[
			"Laser Turrets",
			"激光炮塔",
			"LT"
		],
		[
			"Missile Turrets",
			"导弹炮塔",
			"MT"
		],
		[
			"Plasma Turrets",
			"电浆炮塔",
			"PT"
		],
		[
			"Ion Turrets",
			"离子炮塔",
			"IT"
		],
		[
			"Photon Turrets",
			"光子炮塔",
			"OT"
		],
		[
			"Disruptor Turrets",
			"裂解炮塔",
			"DT"
		],
		[
			"Deflection Shields",
			"偏折护盾",
			"FS"
		],
		[
			"Planetary Shield",
			"行星护盾",
			"PS"
		],
		[
			"Planetary Ring",
			"女神的项链",
			"PR"
		]
	];
	function parseFleetUnit(nameText, quantityText, includeDefenses = false) {
		const name = nameText.trim();
		const count = quantityText.trim();
		if (!name || !/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(count)) return;
		const quantity = Number(count.replaceAll(",", ""));
		if (!Number.isSafeInteger(quantity) || quantity <= 0) return;
		return {
			...identifyFleetUnit(name, includeDefenses),
			quantity
		};
	}
	function identifyFleetUnit(nameText, includeDefenses = true) {
		const name = nameText.trim();
		const normalizedName = name.toLowerCase();
		const [english = name, chinese = name, code] = (includeDefenses ? shipsAndDefenses : ships).find(([en, zh]) => en.toLowerCase() === normalizedName || zh === name) ?? [];
		return {
			name,
			english,
			chinese,
			code
		};
	}
	function formatFleetTsv(units, language) {
		return units.map((unit) => `${unit[language]}\t${unit.quantity}`).join("\n");
	}
	function buildCalculatorUrl(rosters, technologies, locale = "zh-CN") {
		const unknownNames = Object.values(rosters).flatMap((units) => units.filter((unit) => !unit.code).map((unit) => unit.name));
		if (unknownNames.length) return { unknownNames };
		const url = new URL(`https://aebits.win/${locale === "en" ? "en" : "zh"}/aeBattleCalc`);
		for (const side of ["aS", "dS"]) {
			const units = rosters[side];
			if (units?.length) url.searchParams.set(side, units.map((unit) => `${unit.code}:${unit.quantity}`).join(","));
		}
		for (const side of ["aT", "dT"]) {
			const fields = Object.entries(technologies?.[side] ?? {});
			if (fields.length) url.searchParams.set(side, fields.map(([field, level]) => `${field}:${level}`).join(","));
		}
		url.searchParams.set("gv", "5");
		return { url };
	}
	var serverOffset = 36e5;
	var englishMonths = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
	var chineseMonths = "一 二 三 四 五 六 七 八 九 十 十一 十二".split(" ").map((month) => month + "月");
	function parseTravelDuration(text) {
		const match = text.trim().match(/^(?:(\d+)\s*(?:h|小时)\s*)?(?:(\d+)\s*(?:m|分钟)\s*)?(?:(\d+)\s*(?:s|秒))?$/i);
		if (!match) return null;
		const [, hours = "0", minutes = "0", seconds = "0"] = match;
		const duration = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
		return Number(minutes) < 60 && Number(seconds) < 60 && Number.isSafeInteger(duration) && duration > 0 ? duration : null;
	}
	function parseServerTime(text) {
		const numeric = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})$/);
		const named = numeric ? null : text.match(/^(?:(\d{1,2})\s+(\S+)|(\S+)\s+(\d{1,2}))\s+(\d{4}),\s+(\d{2}):(\d{2}):(\d{2})$/);
		const parts = numeric?.slice(1) ?? (named && [
			named[5],
			findMonth(named[2] ?? named[3]),
			named[1] ?? named[4],
			...named.slice(6)
		]);
		if (!parts) return null;
		const [year, month, day, hours, minutes, seconds] = parts.map(Number);
		const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
		if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day || date.getUTCHours() !== hours || date.getUTCMinutes() !== minutes || date.getUTCSeconds() !== seconds) return null;
		return date.getTime() - serverOffset;
	}
	function findMonth(text) {
		return (text.endsWith("月") ? chineseMonths : englishMonths).indexOf(text) + 1;
	}
	function formatServerTime(timestamp) {
		return formatClockTime(timestamp + serverOffset);
	}
	function formatLocalTime(timestamp) {
		return formatClockTime(timestamp - new Date(timestamp).getTimezoneOffset() * 60 * 1e3);
	}
	function formatClockTime(timestamp) {
		const date = new Date(timestamp);
		return Number.isFinite(date.getTime()) ? date.toISOString().split(".")[0].replace("T", " ") : null;
	}
	var arrivalPanelId = "astro-empires-fleet-arrival";
	var styles = `
:host {
    all: initial !important;
    display: block !important;
    margin-block-start: 8px !important;
}
.arrival {
    font: 14px/1.45 system-ui, sans-serif;
    color: #e7f1f6;
    direction: ltr;
    text-align: start;
}
dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 2px 8px;
    margin: 4px 0 0;
}
dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
}
`;
	function mountFleetArrival() {
		if (document.getElementById(arrivalPanelId)) return;
		const form = document.getElementById("move_fleet_form");
		const duration = form?.querySelector("#duration");
		const destination = form?.querySelector("#destination");
		const table = duration?.closest("table");
		if (!duration || !destination || !table) return;
		const host = document.createElement("div");
		host.id = arrivalPanelId;
		const shadow = host.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = styles;
		const container = document.createElement("div");
		container.className = "arrival";
		shadow.append(style, container);
		table.after(host);
		const arrival = (0, vue.ref)(null);
		let serverClock = "";
		let serverSample = null;
		let calculatedDestination = destination.value;
		const refresh = () => {
			const clock = document.getElementById("server-time")?.textContent.trim() ?? "";
			const now = performance.now();
			if (clock !== serverClock) {
				serverClock = clock;
				const timestamp = parseServerTime(clock);
				serverSample = timestamp === null ? null : {
					timestamp,
					sampledAt: now
				};
			}
			const seconds = parseTravelDuration(duration.textContent);
			const target = destination.value;
			if (seconds === null || target !== calculatedDestination || !/^[a-z]\d{2}(?::\d{2}){3}$/i.test(target)) {
				arrival.value = null;
				return;
			}
			const durationMs = seconds * 1e3;
			const local = formatLocalTime(Date.now() + durationMs);
			const server = serverSample && formatServerTime(serverSample.timestamp + (now - serverSample.sampledAt) + durationMs);
			arrival.value = local === null ? null : {
				server,
				local
			};
		};
		(0, vue.createApp)({ render: () => [(0, vue.h)("strong", t("estimatedArrival")), arrival.value ? (0, vue.h)("dl", [
			(0, vue.h)("dt", t("serverTime")),
			(0, vue.h)("dd", arrival.value.server ?? t("unavailable")),
			(0, vue.h)("dt", t("localTime")),
			(0, vue.h)("dd", arrival.value.local)
		]) : (0, vue.h)("div", t("waitingTravel"))] }).mount(container);
		new MutationObserver(() => {
			calculatedDestination = destination.value;
			refresh();
		}).observe(duration, {
			childList: true,
			characterData: true,
			subtree: true
		});
		destination.addEventListener("input", refresh);
		refresh();
		window.setInterval(refresh, 1e3);
	}
	function cn(...args) {
		if (args) {
			let classes = [];
			for (let i = 0; i < args.length; i++) {
				const className = args[i];
				if (!className) continue;
				const type = typeof className;
				if (type === "string" || type === "number") classes.push(className);
				else if (type === "object") {
					const _classes = Array.isArray(className) ? [cn(...className)] : Object.entries(className).map(([key, value]) => value ? key : void 0);
					classes = _classes.length ? classes.concat(_classes.filter((c) => !!c)) : classes;
				}
			}
			return classes.join(" ").trim();
		}
	}
	function hasClass(element, className) {
		if (element) {
			if (element.classList) return element.classList.contains(className);
			else return new RegExp("(^| )" + className + "( |$)", "gi").test(element.className);
		}
		return false;
	}
	function addClass(element, className) {
		if (element && className) {
			const fn = (_className) => {
				if (!hasClass(element, _className)) {
					if (element.classList) element.classList.add(_className);
					else element.className += " " + _className;
				}
			};
			[className].flat().filter(Boolean).forEach((_classNames) => _classNames.split(" ").forEach(fn));
		}
	}
	function removeClass(element, className) {
		if (element && className) {
			const fn = (_className) => {
				if (element.classList) element.classList.remove(_className);
				else element.className = element.className.replace(new RegExp("(^|\\b)" + _className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
			};
			[className].flat().filter(Boolean).forEach((_classNames) => _classNames.split(" ").forEach(fn));
		}
	}
	function getScrollLeft(element) {
		return element ? Math.abs(element.scrollLeft) : 0;
	}
	function getOuterWidth(element, margin) {
		if (element instanceof HTMLElement) {
			let width = element.offsetWidth;
			if (margin) {
				const style = getComputedStyle(element);
				width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
			}
			return width;
		}
		return 0;
	}
	function getParentNode(element) {
		if (element) {
			let parent = element.parentNode;
			if (parent && parent instanceof ShadowRoot && parent.host) parent = parent.host;
			return parent;
		}
		return null;
	}
	function isExist(element) {
		return !!(element !== null && typeof element !== "undefined" && element.nodeName && getParentNode(element));
	}
	function isElement(element) {
		return typeof Element !== "undefined" ? element instanceof Element : element !== null && typeof element === "object" && element.nodeType === 1 && typeof element.nodeName === "string";
	}
	function setAttributes(element, attributes = {}) {
		if (isElement(element)) {
			const computedStyles = (rule, value) => {
				const styles = element?.$attrs?.[rule] ? [element?.$attrs?.[rule]] : [];
				return [value].flat().reduce((cv, v) => {
					if (v !== null && v !== void 0) {
						const type = typeof v;
						if (type === "string" || type === "number") cv.push(v);
						else if (type === "object") {
							const _cv = Array.isArray(v) ? computedStyles(rule, v) : Object.entries(v).map(([_k, _v]) => rule === "style" && (!!_v || _v === 0) ? `${_k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${_v}` : _v ? _k : void 0);
							cv = _cv.length ? cv.concat(_cv.filter((c) => !!c)) : cv;
						}
					}
					return cv;
				}, styles);
			};
			Object.entries(attributes).forEach(([key, value]) => {
				if (value !== void 0 && value !== null) {
					const matchedEvent = key.match(/^on(.+)/);
					if (matchedEvent) element.addEventListener(matchedEvent[1].toLowerCase(), value);
					else if (key === "p-bind" || key === "pBind") setAttributes(element, value);
					else {
						value = key === "class" ? [...new Set(computedStyles("class", value))].join(" ").trim() : key === "style" ? computedStyles("style", value).join(";").trim() : value;
						(element.$attrs = element.$attrs || {}) && (element.$attrs[key] = value);
						element.setAttribute(key, value);
					}
				}
			});
		}
	}
	function createElement(type, attributes = {}, ...children) {
		if (type) {
			const element = document.createElement(type);
			setAttributes(element, attributes);
			element.append(...children);
			return element;
		}
	}
	function findSingle(element, selector) {
		return isElement(element) ? element.matches(selector) ? element : element.querySelector(selector) : null;
	}
	function getAttribute(element, name) {
		if (isElement(element)) {
			const value = element.getAttribute(name);
			if (!isNaN(value)) return +value;
			if (value === "true" || value === "false") return value === "true";
			return value;
		}
	}
	function getHeight(element) {
		if (element) {
			let height = element.offsetHeight;
			const style = getComputedStyle(element);
			height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			return height;
		}
		return 0;
	}
	function getOffset(element) {
		if (element) {
			const rect = element.getBoundingClientRect();
			return {
				top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
				left: rect.left + (window.pageXOffset || getScrollLeft(document.documentElement) || getScrollLeft(document.body) || 0)
			};
		}
		return {
			top: "auto",
			left: "auto"
		};
	}
	function getOuterHeight(element, margin) {
		if (element) {
			let height = element.offsetHeight;
			if (margin) {
				const style = getComputedStyle(element);
				height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
			}
			return height;
		}
		return 0;
	}
	function getWidth(element) {
		if (element) {
			let width = element.offsetWidth;
			const style = getComputedStyle(element);
			width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
			return width;
		}
		return 0;
	}
	function isClient() {
		return !!(typeof window !== "undefined" && window.document && window.document.createElement);
	}
	function setAttribute(element, attribute = "", value) {
		if (isElement(element) && value !== null && value !== void 0) element.setAttribute(attribute, value);
	}
	function EventBus() {
		const allHandlers = new Map();
		return {
			on(type, handler) {
				let handlers = allHandlers.get(type);
				if (!handlers) handlers = [handler];
				else handlers.push(handler);
				allHandlers.set(type, handlers);
				return this;
			},
			off(type, handler) {
				const handlers = allHandlers.get(type);
				if (handlers) handlers.splice(handlers.indexOf(handler) >>> 0, 1);
				return this;
			},
			emit(type, evt) {
				const handlers = allHandlers.get(type);
				if (handlers) handlers.forEach((handler) => {
					handler(evt);
				});
			},
			clear() {
				allHandlers.clear();
			}
		};
	}
	function isEmpty(value) {
		return value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0 || !(value instanceof Date) && typeof value === "object" && Object.keys(value).length === 0;
	}
	function isFunction(value) {
		return typeof value === "function" && "call" in value && "apply" in value;
	}
	function isNotEmpty(value) {
		return !isEmpty(value);
	}
	function isObject(value, empty = true) {
		return value instanceof Object && value.constructor === Object && (empty || Object.keys(value).length !== 0);
	}
	function _deepMerge(target = {}, source = {}) {
		const mergedObj = { ...target };
		Object.keys(source).forEach((key) => {
			const typedKey = key;
			if (isObject(source[typedKey]) && typedKey in target && isObject(target[typedKey])) mergedObj[typedKey] = _deepMerge(target[typedKey], source[typedKey]);
			else mergedObj[typedKey] = source[typedKey];
		});
		return mergedObj;
	}
	function deepMerge(...args) {
		return args.reduce((acc, obj, i) => i === 0 ? obj : _deepMerge(acc, obj), {});
	}
	function resolve(obj, ...params) {
		return isFunction(obj) ? obj(...params) : obj;
	}
	function isString(value, empty = true) {
		return typeof value === "string" && (empty || value !== "");
	}
	function toFlatCase(str) {
		return isString(str) ? str.replace(/(-|_)/g, "").toLowerCase() : str;
	}
	function getKeyValue(obj, key = "", params = {}) {
		const fKeys = toFlatCase(key).split(".");
		const fKey = fKeys.shift();
		if (fKey) {
			if (isObject(obj)) return getKeyValue(resolve(obj[Object.keys(obj).find((k) => toFlatCase(k) === fKey) || ""], params), fKeys.join("."), params);
			return;
		}
		return resolve(obj, params);
	}
	function isArray(value, empty = true) {
		return Array.isArray(value) && (empty || value.length !== 0);
	}
	function isNumber(value) {
		return isNotEmpty(value) && !isNaN(value);
	}
	function matchRegex(str, regex) {
		if (regex) {
			const match = regex.test(str);
			regex.lastIndex = 0;
			return match;
		}
		return false;
	}
	function mergeKeys(...args) {
		return deepMerge(...args);
	}
	function minifyCSS(css) {
		return css ? css.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim() : css;
	}
	function toCapitalCase(str) {
		return isString(str, false) ? str[0].toUpperCase() + str.slice(1) : str;
	}
	function toKebabCase(str) {
		return isString(str) ? str.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : str;
	}
	var lastIds = {};
	function uuid(prefix = "pui_id_") {
		if (!Object.hasOwn(lastIds, prefix)) lastIds[prefix] = 0;
		lastIds[prefix]++;
		return `${prefix}${lastIds[prefix]}`;
	}
	var ThemeService = EventBus();
	var EXPR_REGEX = /{([^}]*)}/g;
	var CALC_REGEX = /(\d+\s+[\+\-\*\/]\s+\d+)/g;
	var VAR_REGEX = /var\([^)]+\)/g;
	function toTokenKey(str) {
		return isString(str) ? str.replace(/[A-Z]/g, (c, i) => i === 0 ? c : "." + c.toLowerCase()).toLowerCase() : str;
	}
	function toValue(value) {
		return isObject(value) && value.hasOwnProperty("$value") && value.hasOwnProperty("$type") ? value.$value : value;
	}
	function toNormalizePrefix(prefix) {
		return prefix.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
	}
	function toNormalizeVariable(prefix = "", variable = "") {
		return toNormalizePrefix(`${isString(prefix, false) && isString(variable, false) ? `${prefix}-` : prefix}${variable}`);
	}
	function getVariableName(prefix = "", variable = "") {
		return `--${toNormalizeVariable(prefix, variable)}`;
	}
	function hasOddBraces(str = "") {
		return ((str.match(/{/g) || []).length + (str.match(/}/g) || []).length) % 2 !== 0;
	}
	function getVariableValue(value, variable = "", prefix = "", excludedKeyRegexes = [], fallback) {
		if (isString(value)) {
			const val = value.trim();
			if (hasOddBraces(val)) return;
			else if (matchRegex(val, EXPR_REGEX)) {
				const _val = val.replaceAll(EXPR_REGEX, (v) => {
					return `var(${getVariableName(prefix, toKebabCase(v.replace(/{|}/g, "").split(".").filter((_v) => !excludedKeyRegexes.some((_r) => matchRegex(_v, _r))).join("-")))}${isNotEmpty(fallback) ? `, ${fallback}` : ""})`;
				});
				return matchRegex(_val.replace(VAR_REGEX, "0"), CALC_REGEX) ? `calc(${_val})` : _val;
			}
			return val;
		} else if (isNumber(value)) return value;
	}
	function setProperty(properties, key, value) {
		if (isString(key, false)) properties.push(`${key}:${value};`);
	}
	function getRule(selector, properties) {
		if (selector) return `${selector}{${properties}}`;
		return "";
	}
	function evaluateDtExpressions(input, fn) {
		if (input.indexOf("dt(") === -1) return input;
		function fastParseArgs(str, fn) {
			const args = [];
			let i = 0;
			let current = "";
			let quote = null;
			let depth = 0;
			while (i <= str.length) {
				const c = str[i];
				if ((c === "\"" || c === "'" || c === "`") && str[i - 1] !== "\\") quote = quote === c ? null : c;
				if (!quote) {
					if (c === "(") depth++;
					if (c === ")") depth--;
					if ((c === "," || i === str.length) && depth === 0) {
						const arg = current.trim();
						if (arg.startsWith("dt(")) args.push(evaluateDtExpressions(arg, fn));
						else args.push(parseArg(arg));
						current = "";
						i++;
						continue;
					}
				}
				if (c !== void 0) current += c;
				i++;
			}
			return args;
		}
		function parseArg(arg) {
			const q = arg[0];
			if ((q === "\"" || q === "'" || q === "`") && arg[arg.length - 1] === q) return arg.slice(1, -1);
			const num = Number(arg);
			return isNaN(num) ? arg : num;
		}
		const indices = [];
		const stack = [];
		for (let i = 0; i < input.length; i++) if (input[i] === "d" && input.slice(i, i + 3) === "dt(") {
			stack.push(i);
			i += 2;
		} else if (input[i] === ")" && stack.length > 0) {
			const start = stack.pop();
			if (stack.length === 0) indices.push([start, i]);
		}
		if (!indices.length) return input;
		for (let i = indices.length - 1; i >= 0; i--) {
			const [start, end] = indices[i];
			const resolved = fn(...fastParseArgs(input.slice(start + 3, end), fn));
			input = input.slice(0, start) + resolved + input.slice(end + 1);
		}
		return input;
	}
	var dt = (...args) => {
		return dtwt(config_default.getTheme(), ...args);
	};
	var dtwt = (theme = {}, tokenPath, fallback, type) => {
		if (tokenPath) {
			const { variable: VARIABLE, options: OPTIONS } = config_default.defaults || {};
			const { prefix, transform } = theme?.options || OPTIONS || {};
			const token = matchRegex(tokenPath, EXPR_REGEX) ? tokenPath : `{${tokenPath}}`;
			return type === "value" || isEmpty(type) && transform === "strict" ? config_default.getTokenValue(tokenPath) : getVariableValue(token, void 0, prefix, [VARIABLE.excludedKeyRegex], fallback);
		}
		return "";
	};
	function css(strings, ...exprs) {
		if (strings instanceof Array) return evaluateDtExpressions(strings.reduce((acc, str, i) => acc + str + (resolve(exprs[i], { dt }) ?? ""), ""), dt);
		return resolve(strings, { dt });
	}
	function toVariables_default(theme, options = {}) {
		const VARIABLE = config_default.defaults.variable;
		const { prefix = VARIABLE.prefix, selector = VARIABLE.selector, excludedKeyRegex = VARIABLE.excludedKeyRegex } = options;
		const tokens = [];
		const variables = [];
		const stack = [{
			node: theme,
			path: prefix
		}];
		while (stack.length) {
			const { node, path } = stack.pop();
			for (const key in node) {
				const raw = node[key];
				const val = toValue(raw);
				const variablePath = matchRegex(key, excludedKeyRegex) ? toNormalizeVariable(path) : toNormalizeVariable(path, toKebabCase(key));
				if (isObject(val)) stack.push({
					node: val,
					path: variablePath
				});
				else {
					setProperty(variables, getVariableName(variablePath), getVariableValue(val, variablePath, prefix, [excludedKeyRegex]));
					let token = variablePath;
					if (prefix && token.startsWith(prefix + "-")) token = token.slice(prefix.length + 1);
					tokens.push(token.replace(/-/g, "."));
				}
			}
		}
		const declarations = variables.join("");
		return {
			value: variables,
			tokens,
			declarations,
			css: getRule(selector, declarations)
		};
	}
	var themeUtils_default = {
		regex: {
			rules: {
				class: {
					pattern: /^\.([a-zA-Z][\w-]*)$/,
					resolve(value) {
						return {
							type: "class",
							selector: value,
							matched: this.pattern.test(value.trim())
						};
					}
				},
				attr: {
					pattern: /^\[(.*)\]$/,
					resolve(value) {
						return {
							type: "attr",
							selector: `:root${value},:host${value}`,
							matched: this.pattern.test(value.trim())
						};
					}
				},
				media: {
					pattern: /^@media (.*)$/,
					resolve(value) {
						return {
							type: "media",
							selector: value,
							matched: this.pattern.test(value.trim())
						};
					}
				},
				system: {
					pattern: /^system$/,
					resolve(value) {
						return {
							type: "system",
							selector: "@media (prefers-color-scheme: dark)",
							matched: this.pattern.test(value.trim())
						};
					}
				},
				custom: { resolve(value) {
					return {
						type: "custom",
						selector: value,
						matched: true
					};
				} }
			},
			resolve(value) {
				const rules = Object.keys(this.rules).filter((k) => k !== "custom").map((r) => this.rules[r]);
				return [value].flat().map((v) => rules.map((r) => r.resolve(v)).find((rr) => rr.matched) ?? this.rules.custom.resolve(v));
			}
		},
		_toVariables(theme, options) {
			return toVariables_default(theme, { prefix: options?.prefix });
		},
		getCommon({ name = "", theme = {}, params, set, defaults }) {
			const { preset, options } = theme;
			let primitive_css, primitive_tokens, semantic_css, semantic_tokens, global_css, global_tokens, style;
			if (isNotEmpty(preset) && options.transform !== "strict") {
				const { primitive, semantic, extend } = preset;
				const { colorScheme, ...sRest } = semantic || {};
				const { colorScheme: eColorScheme, ...eRest } = extend || {};
				const { dark, ...csRest } = colorScheme || {};
				const { dark: eDark, ...ecsRest } = eColorScheme || {};
				const prim_var = isNotEmpty(primitive) ? this._toVariables({ primitive }, options) : {};
				const sRest_var = isNotEmpty(sRest) ? this._toVariables({ semantic: sRest }, options) : {};
				const csRest_var = isNotEmpty(csRest) ? this._toVariables({ light: csRest }, options) : {};
				const csDark_var = isNotEmpty(dark) ? this._toVariables({ dark }, options) : {};
				const eRest_var = isNotEmpty(eRest) ? this._toVariables({ semantic: eRest }, options) : {};
				const ecsRest_var = isNotEmpty(ecsRest) ? this._toVariables({ light: ecsRest }, options) : {};
				const ecsDark_var = isNotEmpty(eDark) ? this._toVariables({ dark: eDark }, options) : {};
				const [prim_css, prim_tokens] = [prim_var.declarations ?? "", prim_var.tokens];
				const [sRest_css, sRest_tokens] = [sRest_var.declarations ?? "", sRest_var.tokens || []];
				const [csRest_css, csRest_tokens] = [csRest_var.declarations ?? "", csRest_var.tokens || []];
				const [csDark_css, csDark_tokens] = [csDark_var.declarations ?? "", csDark_var.tokens || []];
				const [eRest_css, eRest_tokens] = [eRest_var.declarations ?? "", eRest_var.tokens || []];
				const [ecsRest_css, ecsRest_tokens] = [ecsRest_var.declarations ?? "", ecsRest_var.tokens || []];
				const [ecsDark_css, ecsDark_tokens] = [ecsDark_var.declarations ?? "", ecsDark_var.tokens || []];
				primitive_css = this.transformCSS(name, prim_css, "light", "variable", options, set, defaults);
				primitive_tokens = prim_tokens;
				semantic_css = `${this.transformCSS(name, `${sRest_css}${csRest_css}`, "light", "variable", options, set, defaults)}${this.transformCSS(name, `${csDark_css}`, "dark", "variable", options, set, defaults)}`;
				semantic_tokens = [...new Set([
					...sRest_tokens,
					...csRest_tokens,
					...csDark_tokens
				])];
				global_css = `${this.transformCSS(name, `${eRest_css}${ecsRest_css}color-scheme:light`, "light", "variable", options, set, defaults)}${this.transformCSS(name, `${ecsDark_css}color-scheme:dark`, "dark", "variable", options, set, defaults)}`;
				global_tokens = [...new Set([
					...eRest_tokens,
					...ecsRest_tokens,
					...ecsDark_tokens
				])];
				style = resolve(preset.css, { dt });
			}
			return {
				primitive: {
					css: primitive_css,
					tokens: primitive_tokens
				},
				semantic: {
					css: semantic_css,
					tokens: semantic_tokens
				},
				global: {
					css: global_css,
					tokens: global_tokens
				},
				style
			};
		},
		getPreset({ name = "", preset = {}, options, params, set, defaults, selector }) {
			let p_css, p_tokens, p_style;
			if (isNotEmpty(preset) && options.transform !== "strict") {
				const _name = name.replace("-directive", "");
				const { colorScheme, extend, css, ...vRest } = preset;
				const { colorScheme: eColorScheme, ...evRest } = extend || {};
				const { dark, ...csRest } = colorScheme || {};
				const { dark: ecsDark, ...ecsRest } = eColorScheme || {};
				const vRest_var = isNotEmpty(vRest) ? this._toVariables({ [_name]: {
					...vRest,
					...evRest
				} }, options) : {};
				const csRest_var = isNotEmpty(csRest) ? this._toVariables({ [_name]: {
					...csRest,
					...ecsRest
				} }, options) : {};
				const csDark_var = isNotEmpty(dark) ? this._toVariables({ [_name]: {
					...dark,
					...ecsDark
				} }, options) : {};
				const [vRest_css, vRest_tokens] = [vRest_var.declarations ?? "", vRest_var.tokens || []];
				const [csRest_css, csRest_tokens] = [csRest_var.declarations ?? "", csRest_var.tokens || []];
				const [csDark_css, csDark_tokens] = [csDark_var.declarations ?? "", csDark_var.tokens || []];
				p_css = `${this.transformCSS(_name, `${vRest_css}${csRest_css}`, "light", "variable", options, set, defaults, selector)}${this.transformCSS(_name, csDark_css, "dark", "variable", options, set, defaults, selector)}`;
				p_tokens = [...new Set([
					...vRest_tokens,
					...csRest_tokens,
					...csDark_tokens
				])];
				p_style = resolve(css, { dt });
			}
			return {
				css: p_css,
				tokens: p_tokens,
				style: p_style
			};
		},
		getPresetC({ name = "", theme = {}, params, set, defaults }) {
			const { preset, options } = theme;
			const cPreset = preset?.components?.[name];
			return this.getPreset({
				name,
				preset: cPreset,
				options,
				params,
				set,
				defaults
			});
		},
		getPresetD({ name = "", theme = {}, params, set, defaults }) {
			const dName = name.replace("-directive", "");
			const { preset, options } = theme;
			const dPreset = preset?.components?.[dName] || preset?.directives?.[dName];
			return this.getPreset({
				name: dName,
				preset: dPreset,
				options,
				params,
				set,
				defaults
			});
		},
		applyDarkColorScheme(options) {
			return !(options.darkModeSelector === "none" || options.darkModeSelector === false);
		},
		getColorSchemeOption(options, defaults) {
			return this.applyDarkColorScheme(options) ? this.regex.resolve(options.darkModeSelector === true ? defaults.options.darkModeSelector : options.darkModeSelector ?? defaults.options.darkModeSelector) : [];
		},
		getLayerOrder(name, options = {}, params, defaults) {
			const { cssLayer } = options;
			if (cssLayer) return `@layer ${resolve(cssLayer.order || cssLayer.name || "primeui", params)}`;
			return "";
		},
		getCommonStyleSheet({ name = "", theme = {}, params, props = {}, set, defaults }) {
			const common = this.getCommon({
				name,
				theme,
				params,
				set,
				defaults
			});
			const _props = Object.entries(props).reduce((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, []).join(" ");
			return Object.entries(common || {}).reduce((acc, [key, value]) => {
				if (isObject(value) && Object.hasOwn(value, "css")) {
					const _css = minifyCSS(value.css);
					const id = `${key}-variables`;
					acc.push(`<style type="text/css" data-primevue-style-id="${id}" ${_props}>${_css}</style>`);
				}
				return acc;
			}, []).join("");
		},
		getStyleSheet({ name = "", theme = {}, params, props = {}, set, defaults }) {
			const options = {
				name,
				theme,
				params,
				set,
				defaults
			};
			const preset_css = (name.includes("-directive") ? this.getPresetD(options) : this.getPresetC(options))?.css;
			const _props = Object.entries(props).reduce((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, []).join(" ");
			return preset_css ? `<style type="text/css" data-primevue-style-id="${name}-variables" ${_props}>${minifyCSS(preset_css)}</style>` : "";
		},
		createTokens(obj = {}, defaults, parentKey = "", parentPath = "", tokens = {}) {
			const computedFn = function(colorScheme, tokenPathMap = {}, stack = []) {
				if (stack.includes(this.path)) {
					console.warn(`Circular reference detected at ${this.path}`);
					return {
						colorScheme,
						path: this.path,
						paths: tokenPathMap,
						value: void 0
					};
				}
				stack.push(this.path);
				tokenPathMap["name"] = this.path;
				tokenPathMap["binding"] ||= {};
				let computedValue = this.value;
				if (typeof this.value === "string" && EXPR_REGEX.test(this.value)) {
					const _val = this.value.trim().replace(EXPR_REGEX, (v) => {
						const refPath = v.slice(1, -1);
						const refToken = this.tokens[refPath];
						if (!refToken) {
							console.warn(`Token not found for path: ${refPath}`);
							return `__UNRESOLVED__`;
						}
						const computed = refToken.computed(colorScheme, tokenPathMap, stack);
						if (Array.isArray(computed) && computed.length === 2) return `light-dark(${computed[0].value},${computed[1].value})`;
						else return computed?.value ?? `__UNRESOLVED__`;
					});
					computedValue = CALC_REGEX.test(_val.replace(VAR_REGEX, "0")) ? `calc(${_val})` : _val;
				}
				if (isEmpty(tokenPathMap["binding"])) delete tokenPathMap["binding"];
				stack.pop();
				return {
					colorScheme,
					path: this.path,
					paths: tokenPathMap,
					value: computedValue.includes("__UNRESOLVED__") ? void 0 : computedValue
				};
			};
			const traverse = (obj, parentKey, parentPath) => {
				Object.entries(obj).forEach(([key, value]) => {
					const currentKey = matchRegex(key, defaults.variable.excludedKeyRegex) ? parentKey : parentKey ? `${parentKey}.${toTokenKey(key)}` : toTokenKey(key);
					const currentPath = parentPath ? `${parentPath}.${key}` : key;
					if (isObject(value)) traverse(value, currentKey, currentPath);
					else {
						if (!tokens[currentKey]) tokens[currentKey] = {
							paths: [],
							computed: (colorScheme, tokenPathMap = {}, stack = []) => {
								if (tokens[currentKey].paths.length === 1) return tokens[currentKey].paths[0].computed(tokens[currentKey].paths[0].scheme, tokenPathMap["binding"], stack);
								else if (colorScheme && colorScheme !== "none") for (let i = 0; i < tokens[currentKey].paths.length; i++) {
									const p = tokens[currentKey].paths[i];
									if (p.scheme === colorScheme) return p.computed(colorScheme, tokenPathMap["binding"], stack);
								}
								return tokens[currentKey].paths.map((p) => p.computed(p.scheme, tokenPathMap[p.scheme], stack));
							}
						};
						tokens[currentKey].paths.push({
							path: currentPath,
							value,
							scheme: currentPath.includes("colorScheme.light") ? "light" : currentPath.includes("colorScheme.dark") ? "dark" : "none",
							computed: computedFn,
							tokens
						});
					}
				});
			};
			traverse(obj, parentKey, parentPath);
			return tokens;
		},
		getTokenValue(tokens, path, defaults) {
			const normalizePath = (str) => {
				return str.split(".").filter((s) => !matchRegex(s.toLowerCase(), defaults.variable.excludedKeyRegex)).join(".");
			};
			const token = normalizePath(path);
			const colorScheme = path.includes("colorScheme.light") ? "light" : path.includes("colorScheme.dark") ? "dark" : void 0;
			const computedValues = [tokens[token]?.computed(colorScheme)].flat().filter((computed) => computed);
			return computedValues.length === 1 ? computedValues[0].value : computedValues.reduce((acc = {}, computed) => {
				const { colorScheme: cs, ...rest } = computed;
				acc[cs] = rest;
				return acc;
			}, void 0);
		},
		getSelectorRule(selector1, selector2, type, css) {
			return type === "class" || type === "attr" ? getRule(isNotEmpty(selector2) ? `${selector1}${selector2},${selector1} ${selector2}` : selector1, css) : getRule(selector1, getRule(selector2 ?? ":root,:host", css));
		},
		transformCSS(name, css, mode, type, options = {}, set, defaults, selector) {
			if (isNotEmpty(css)) {
				const { cssLayer } = options;
				if (type !== "style") {
					const colorSchemeOption = this.getColorSchemeOption(options, defaults);
					css = mode === "dark" ? colorSchemeOption.reduce((acc, { type, selector: _selector }) => {
						if (isNotEmpty(_selector)) acc += _selector.includes("[CSS]") ? _selector.replace("[CSS]", css) : this.getSelectorRule(_selector, selector, type, css);
						return acc;
					}, "") : getRule(selector ?? ":root,:host", css);
				}
				if (cssLayer) {
					const layerOptions = {
						name: "primeui",
						order: "primeui"
					};
					isObject(cssLayer) && (layerOptions.name = resolve(cssLayer.name, {
						name,
						type
					}));
					if (isNotEmpty(layerOptions.name)) {
						css = getRule(`@layer ${layerOptions.name}`, css);
						set?.layerNames(layerOptions.name);
					}
				}
				return css;
			}
			return "";
		}
	};
	var config_default = {
		defaults: {
			variable: {
				prefix: "p",
				selector: ":root,:host",
				excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi
			},
			options: {
				prefix: "p",
				darkModeSelector: "system",
				cssLayer: false
			}
		},
		_theme: void 0,
		_layerNames: new Set(),
		_loadedStyleNames: new Set(),
		_loadingStyles: new Set(),
		_tokens: {},
		update(newValues = {}) {
			const { theme } = newValues;
			if (theme) {
				this._theme = {
					...theme,
					options: {
						...this.defaults.options,
						...theme.options
					}
				};
				this._tokens = themeUtils_default.createTokens(this.preset, this.defaults);
				this.clearLoadedStyleNames();
			}
		},
		get theme() {
			return this._theme;
		},
		get preset() {
			return this.theme?.preset || {};
		},
		get options() {
			return this.theme?.options || {};
		},
		get tokens() {
			return this._tokens;
		},
		getTheme() {
			return this.theme;
		},
		setTheme(newValue) {
			this.update({ theme: newValue });
			ThemeService.emit("theme:change", newValue);
		},
		getPreset() {
			return this.preset;
		},
		setPreset(newValue) {
			this._theme = {
				...this.theme,
				preset: newValue
			};
			this._tokens = themeUtils_default.createTokens(newValue, this.defaults);
			this.clearLoadedStyleNames();
			ThemeService.emit("preset:change", newValue);
			ThemeService.emit("theme:change", this.theme);
		},
		getOptions() {
			return this.options;
		},
		setOptions(newValue) {
			this._theme = {
				...this.theme,
				options: newValue
			};
			this.clearLoadedStyleNames();
			ThemeService.emit("options:change", newValue);
			ThemeService.emit("theme:change", this.theme);
		},
		getLayerNames() {
			return [...this._layerNames];
		},
		setLayerNames(layerName) {
			this._layerNames.add(layerName);
		},
		getLoadedStyleNames() {
			return this._loadedStyleNames;
		},
		isStyleNameLoaded(name) {
			return this._loadedStyleNames.has(name);
		},
		setLoadedStyleName(name) {
			this._loadedStyleNames.add(name);
		},
		deleteLoadedStyleName(name) {
			this._loadedStyleNames.delete(name);
		},
		clearLoadedStyleNames() {
			this._loadedStyleNames.clear();
		},
		getTokenValue(tokenPath) {
			return themeUtils_default.getTokenValue(this.tokens, tokenPath, this.defaults);
		},
		getCommon(name = "", params) {
			return themeUtils_default.getCommon({
				name,
				theme: this.theme,
				params,
				defaults: this.defaults,
				set: { layerNames: this.setLayerNames.bind(this) }
			});
		},
		getComponent(name = "", params) {
			const options = {
				name,
				theme: this.theme,
				params,
				defaults: this.defaults,
				set: { layerNames: this.setLayerNames.bind(this) }
			};
			return themeUtils_default.getPresetC(options);
		},
		getDirective(name = "", params) {
			const options = {
				name,
				theme: this.theme,
				params,
				defaults: this.defaults,
				set: { layerNames: this.setLayerNames.bind(this) }
			};
			return themeUtils_default.getPresetD(options);
		},
		getCustomPreset(name = "", preset, selector, params) {
			const options = {
				name,
				preset,
				options: this.options,
				selector,
				params,
				defaults: this.defaults,
				set: { layerNames: this.setLayerNames.bind(this) }
			};
			return themeUtils_default.getPreset(options);
		},
		getLayerOrderCSS(name = "") {
			return themeUtils_default.getLayerOrder(name, this.options, { names: this.getLayerNames() }, this.defaults);
		},
		transformCSS(name = "", css, type = "style", mode) {
			return themeUtils_default.transformCSS(name, css, mode, type, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
		},
		getCommonStyleSheet(name = "", params, props = {}) {
			return themeUtils_default.getCommonStyleSheet({
				name,
				theme: this.theme,
				params,
				props,
				defaults: this.defaults,
				set: { layerNames: this.setLayerNames.bind(this) }
			});
		},
		getStyleSheet(name, params, props = {}) {
			return themeUtils_default.getStyleSheet({
				name,
				theme: this.theme,
				params,
				props,
				defaults: this.defaults,
				set: { layerNames: this.setLayerNames.bind(this) }
			});
		},
		onStyleMounted(name) {
			this._loadingStyles.add(name);
		},
		onStyleUpdated(name) {
			this._loadingStyles.add(name);
		},
		onStyleLoaded(event, { name }) {
			if (this._loadingStyles.size) {
				this._loadingStyles.delete(name);
				ThemeService.emit(`theme:${name}:load`, event);
				!this._loadingStyles.size && ThemeService.emit("theme:load");
			}
		}
	};
	var Base = {
		_loadedStyleNames: new Set(),
		getLoadedStyleNames: function getLoadedStyleNames() {
			return this._loadedStyleNames;
		},
		isStyleNameLoaded: function isStyleNameLoaded(name) {
			return this._loadedStyleNames.has(name);
		},
		setLoadedStyleName: function setLoadedStyleName(name) {
			this._loadedStyleNames.add(name);
		},
		deleteLoadedStyleName: function deleteLoadedStyleName(name) {
			this._loadedStyleNames["delete"](name);
		},
		clearLoadedStyleNames: function clearLoadedStyleNames() {
			this._loadedStyleNames.clear();
		}
	};
	var style$3 = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
	function _typeof$9(o) {
		"@babel/helpers - typeof";
		return _typeof$9 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$9(o);
	}
	function ownKeys$5(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread$5(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys$5(Object(t), true).forEach(function(r) {
				_defineProperty$9(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$5(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function _defineProperty$9(e, r, t) {
		return (r = _toPropertyKey$9(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$9(t) {
		var i = _toPrimitive$9(t, "string");
		return "symbol" == _typeof$9(i) ? i : i + "";
	}
	function _toPrimitive$9(t, r) {
		if ("object" != _typeof$9(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$9(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	function tryOnMounted(fn) {
		var sync = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
		if ((0, vue.getCurrentInstance)() && (0, vue.getCurrentInstance)().components) (0, vue.onMounted)(fn);
		else if (sync) fn();
		else (0, vue.nextTick)(fn);
	}
	var _id = 0;
	function useStyle$1(css) {
		var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
		var isLoaded = (0, vue.ref)(false);
		var cssRef = (0, vue.ref)(css);
		var styleRef = (0, vue.ref)(null);
		var defaultDocument = isClient() ? window.document : void 0;
		var _options$document = options.document, document = _options$document === void 0 ? defaultDocument : _options$document, _options$immediate = options.immediate, immediate = _options$immediate === void 0 ? true : _options$immediate, _options$manual = options.manual, manual = _options$manual === void 0 ? false : _options$manual, _options$name = options.name, name = _options$name === void 0 ? "style_".concat(++_id) : _options$name, _options$id = options.id, id = _options$id === void 0 ? void 0 : _options$id, _options$media = options.media, media = _options$media === void 0 ? void 0 : _options$media, _options$nonce = options.nonce, nonce = _options$nonce === void 0 ? void 0 : _options$nonce, _options$first = options.first, first = _options$first === void 0 ? false : _options$first, _options$onMounted = options.onMounted, onStyleMounted = _options$onMounted === void 0 ? void 0 : _options$onMounted, _options$onUpdated = options.onUpdated, onStyleUpdated = _options$onUpdated === void 0 ? void 0 : _options$onUpdated, _options$onLoad = options.onLoad, onStyleLoaded = _options$onLoad === void 0 ? void 0 : _options$onLoad, _options$props = options.props, props = _options$props === void 0 ? {} : _options$props;
		var stop = function stop() {};
		var load = function load(_css) {
			var _props = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			if (!document) return;
			var _styleProps = _objectSpread$5(_objectSpread$5({}, props), _props);
			var _name = _styleProps.name || name, _id = _styleProps.id || id, _nonce = _styleProps.nonce || nonce;
			styleRef.value = document.querySelector("style[data-primevue-style-id=\"".concat(_name, "\"]")) || document.getElementById(_id) || document.createElement("style");
			if (!styleRef.value.isConnected) {
				cssRef.value = _css || css;
				setAttributes(styleRef.value, {
					type: "text/css",
					id: _id,
					media,
					nonce: _nonce
				});
				first ? document.head.prepend(styleRef.value) : document.head.appendChild(styleRef.value);
				setAttribute(styleRef.value, "data-primevue-style-id", _name);
				setAttributes(styleRef.value, _styleProps);
				styleRef.value.onload = function(event) {
					return onStyleLoaded === null || onStyleLoaded === void 0 ? void 0 : onStyleLoaded(event, { name: _name });
				};
				onStyleMounted === null || onStyleMounted === void 0 || onStyleMounted(_name);
			}
			if (isLoaded.value) return;
			stop = (0, vue.watch)(cssRef, function(value) {
				styleRef.value.textContent = value;
				onStyleUpdated === null || onStyleUpdated === void 0 || onStyleUpdated(_name);
			}, { immediate: true });
			isLoaded.value = true;
		};
		var unload = function unload() {
			if (!document || !isLoaded.value) return;
			stop();
			isExist(styleRef.value) && document.head.removeChild(styleRef.value);
			isLoaded.value = false;
			styleRef.value = null;
		};
		if (immediate && !manual) tryOnMounted(load);
		return {
			id,
			name,
			el: styleRef,
			css: cssRef,
			unload,
			load,
			isLoaded: (0, vue.readonly)(isLoaded)
		};
	}
	var styleRoot;
	function setPrimeVueStyleRoot(root) {
		styleRoot = root;
	}
	function useStyle(css, options) {
		const root = styleRoot;
		const document = root ? {
			head: root,
			querySelector: root.querySelector.bind(root),
			getElementById: root.getElementById.bind(root),
			createElement: root.ownerDocument.createElement.bind(root.ownerDocument)
		} : null;
		return useStyle$1(css, {
			...options,
			document
		});
	}
	function _typeof$8(o) {
		"@babel/helpers - typeof";
		return _typeof$8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$8(o);
	}
	var _templateObject;
	var _templateObject2;
	var _templateObject3;
	var _templateObject4;
	function _slicedToArray$2(r, e) {
		return _arrayWithHoles$2(r) || _iterableToArrayLimit$2(r, e) || _unsupportedIterableToArray$4(r, e) || _nonIterableRest$2();
	}
	function _nonIterableRest$2() {
		throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray$4(r, a) {
		if (r) {
			if ("string" == typeof r) return _arrayLikeToArray$4(r, a);
			var t = {}.toString.call(r).slice(8, -1);
			return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$4(r, a) : void 0;
		}
	}
	function _arrayLikeToArray$4(r, a) {
		(null == a || a > r.length) && (a = r.length);
		for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
		return n;
	}
	function _iterableToArrayLimit$2(r, l) {
		var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
		if (null != t) {
			var e, n, i, u, a = [], f = true, o = false;
			try {
				if (i = (t = t.call(r)).next, 0 === l);
				else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
			} catch (r) {
				o = true, n = r;
			} finally {
				try {
					if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
				} finally {
					if (o) throw n;
				}
			}
			return a;
		}
	}
	function _arrayWithHoles$2(r) {
		if (Array.isArray(r)) return r;
	}
	function ownKeys$4(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread$4(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys$4(Object(t), true).forEach(function(r) {
				_defineProperty$8(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$4(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function _defineProperty$8(e, r, t) {
		return (r = _toPropertyKey$8(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$8(t) {
		var i = _toPrimitive$8(t, "string");
		return "symbol" == _typeof$8(i) ? i : i + "";
	}
	function _toPrimitive$8(t, r) {
		if ("object" != _typeof$8(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$8(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	function _taggedTemplateLiteral(e, t) {
		return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
	}
	var BaseStyle = {
		name: "base",
		css: function css(_ref) {
			var dt = _ref.dt;
			return "\n.p-hidden-accessible {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    opacity: 0;\n    overflow: hidden;\n    padding: 0;\n    pointer-events: none;\n    position: absolute;\n    white-space: nowrap;\n    width: 1px;\n}\n\n.p-overflow-hidden {\n    overflow: hidden;\n    padding-right: ".concat(dt("scrollbar.width"), ";\n}\n");
		},
		style: style$3,
		classes: {},
		inlineStyles: {},
		load: function load(style) {
			var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			var computedStyle = (arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(cs) {
				return cs;
			})(css(_templateObject || (_templateObject = _taggedTemplateLiteral(["", ""])), style));
			return isNotEmpty(computedStyle) ? useStyle(minifyCSS(computedStyle), _objectSpread$4({ name: this.name }, options)) : {};
		},
		loadCSS: function loadCSS() {
			var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			return this.load(this.css, options);
		},
		loadStyle: function loadStyle() {
			var _this = this;
			var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var style = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
			return this.load(this.style, options, function() {
				var computedStyle = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				return config_default.transformCSS(options.name || _this.name, "".concat(computedStyle).concat(css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["", ""])), style)));
			});
		},
		getCommonTheme: function getCommonTheme(params) {
			return config_default.getCommon(this.name, params);
		},
		getComponentTheme: function getComponentTheme(params) {
			return config_default.getComponent(this.name, params);
		},
		getDirectiveTheme: function getDirectiveTheme(params) {
			return config_default.getDirective(this.name, params);
		},
		getPresetTheme: function getPresetTheme(preset, selector, params) {
			return config_default.getCustomPreset(this.name, preset, selector, params);
		},
		getLayerOrderThemeCSS: function getLayerOrderThemeCSS() {
			return config_default.getLayerOrderCSS(this.name);
		},
		getStyleSheet: function getStyleSheet() {
			var extendedCSS = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
			var props = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			if (this.css) {
				var _css = resolve(this.css, { dt }) || "";
				var _style = minifyCSS(css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral([
					"",
					"",
					""
				])), _css, extendedCSS));
				var _props = Object.entries(props).reduce(function(acc, _ref2) {
					var _ref3 = _slicedToArray$2(_ref2, 2), k = _ref3[0], v = _ref3[1];
					return acc.push("".concat(k, "=\"").concat(v, "\"")) && acc;
				}, []).join(" ");
				return isNotEmpty(_style) ? "<style type=\"text/css\" data-primevue-style-id=\"".concat(this.name, "\" ").concat(_props, ">").concat(_style, "</style>") : "";
			}
			return "";
		},
		getCommonThemeStyleSheet: function getCommonThemeStyleSheet(params) {
			var props = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			return config_default.getCommonStyleSheet(this.name, params, props);
		},
		getThemeStyleSheet: function getThemeStyleSheet(params) {
			var props = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			var css$2 = [config_default.getStyleSheet(this.name, params, props)];
			if (this.style) {
				var name = this.name === "base" ? "global-style" : "".concat(this.name, "-style");
				var _css = css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["", ""])), resolve(this.style, { dt }));
				var _style = minifyCSS(config_default.transformCSS(name, _css));
				var _props = Object.entries(props).reduce(function(acc, _ref4) {
					var _ref5 = _slicedToArray$2(_ref4, 2), k = _ref5[0], v = _ref5[1];
					return acc.push("".concat(k, "=\"").concat(v, "\"")) && acc;
				}, []).join(" ");
				isNotEmpty(_style) && css$2.push("<style type=\"text/css\" data-primevue-style-id=\"".concat(name, "\" ").concat(_props, ">").concat(_style, "</style>"));
			}
			return css$2.join("");
		},
		extend: function extend(inStyle) {
			return _objectSpread$4(_objectSpread$4({}, this), {}, {
				css: void 0,
				style: void 0
			}, inStyle);
		}
	};
	function useAttrSelector() {
		var prefix = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc";
		var idx = (0, vue.useId)();
		return "".concat(prefix).concat(idx.replace("v-", "").replaceAll("-", "_"));
	}
	var BaseComponentStyle = BaseStyle.extend({ name: "common" });
	function _typeof$7(o) {
		"@babel/helpers - typeof";
		return _typeof$7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$7(o);
	}
	function _toArray(r) {
		return _arrayWithHoles$1(r) || _iterableToArray$2(r) || _unsupportedIterableToArray$3(r) || _nonIterableRest$1();
	}
	function _iterableToArray$2(r) {
		if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}
	function _slicedToArray$1(r, e) {
		return _arrayWithHoles$1(r) || _iterableToArrayLimit$1(r, e) || _unsupportedIterableToArray$3(r, e) || _nonIterableRest$1();
	}
	function _nonIterableRest$1() {
		throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray$3(r, a) {
		if (r) {
			if ("string" == typeof r) return _arrayLikeToArray$3(r, a);
			var t = {}.toString.call(r).slice(8, -1);
			return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$3(r, a) : void 0;
		}
	}
	function _arrayLikeToArray$3(r, a) {
		(null == a || a > r.length) && (a = r.length);
		for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
		return n;
	}
	function _iterableToArrayLimit$1(r, l) {
		var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
		if (null != t) {
			var e, n, i, u, a = [], f = true, o = false;
			try {
				if (i = (t = t.call(r)).next, 0 === l) {
					if (Object(t) !== t) return;
					f = !1;
				} else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
			} catch (r) {
				o = true, n = r;
			} finally {
				try {
					if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
				} finally {
					if (o) throw n;
				}
			}
			return a;
		}
	}
	function _arrayWithHoles$1(r) {
		if (Array.isArray(r)) return r;
	}
	function ownKeys$3(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread$3(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys$3(Object(t), true).forEach(function(r) {
				_defineProperty$7(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$3(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function _defineProperty$7(e, r, t) {
		return (r = _toPropertyKey$7(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$7(t) {
		var i = _toPrimitive$7(t, "string");
		return "symbol" == _typeof$7(i) ? i : i + "";
	}
	function _toPrimitive$7(t, r) {
		if ("object" != _typeof$7(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$7(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var script$5 = {
		name: "BaseComponent",
		props: {
			pt: {
				type: Object,
				"default": void 0
			},
			ptOptions: {
				type: Object,
				"default": void 0
			},
			unstyled: {
				type: Boolean,
				"default": void 0
			},
			dt: {
				type: Object,
				"default": void 0
			}
		},
		inject: { $parentInstance: { "default": void 0 } },
		watch: {
			isUnstyled: {
				immediate: true,
				handler: function handler(newValue) {
					ThemeService.off("theme:change", this._loadCoreStyles);
					if (!newValue) {
						this._loadCoreStyles();
						this._themeChangeListener(this._loadCoreStyles);
					}
				}
			},
			dt: {
				immediate: true,
				handler: function handler(newValue, oldValue) {
					var _this = this;
					ThemeService.off("theme:change", this._themeScopedListener);
					if (newValue) {
						this._loadScopedThemeStyles(newValue);
						this._themeScopedListener = function() {
							return _this._loadScopedThemeStyles(newValue);
						};
						this._themeChangeListener(this._themeScopedListener);
					} else this._unloadScopedThemeStyles();
				}
			}
		},
		scopedStyleEl: void 0,
		rootEl: void 0,
		uid: void 0,
		$attrSelector: void 0,
		beforeCreate: function beforeCreate() {
			var _this$pt, _this$pt2, _this$pt3, _ref, _ref$onBeforeCreate, _this$$primevueConfig, _this$$primevue, _this$$primevue2, _this$$primevue3, _ref2, _ref2$onBeforeCreate;
			var _usept = (_this$pt = this.pt) === null || _this$pt === void 0 ? void 0 : _this$pt["_usept"];
			var originalValue = _usept ? (_this$pt2 = this.pt) === null || _this$pt2 === void 0 || (_this$pt2 = _this$pt2.originalValue) === null || _this$pt2 === void 0 ? void 0 : _this$pt2[this.$.type.name] : void 0;
			(_ref = (_usept ? (_this$pt3 = this.pt) === null || _this$pt3 === void 0 || (_this$pt3 = _this$pt3.value) === null || _this$pt3 === void 0 ? void 0 : _this$pt3[this.$.type.name] : this.pt) || originalValue) === null || _ref === void 0 || (_ref = _ref.hooks) === null || _ref === void 0 || (_ref$onBeforeCreate = _ref["onBeforeCreate"]) === null || _ref$onBeforeCreate === void 0 || _ref$onBeforeCreate.call(_ref);
			var _useptInConfig = (_this$$primevueConfig = this.$primevueConfig) === null || _this$$primevueConfig === void 0 || (_this$$primevueConfig = _this$$primevueConfig.pt) === null || _this$$primevueConfig === void 0 ? void 0 : _this$$primevueConfig["_usept"];
			var originalValueInConfig = _useptInConfig ? (_this$$primevue = this.$primevue) === null || _this$$primevue === void 0 || (_this$$primevue = _this$$primevue.config) === null || _this$$primevue === void 0 || (_this$$primevue = _this$$primevue.pt) === null || _this$$primevue === void 0 ? void 0 : _this$$primevue.originalValue : void 0;
			(_ref2 = (_useptInConfig ? (_this$$primevue2 = this.$primevue) === null || _this$$primevue2 === void 0 || (_this$$primevue2 = _this$$primevue2.config) === null || _this$$primevue2 === void 0 || (_this$$primevue2 = _this$$primevue2.pt) === null || _this$$primevue2 === void 0 ? void 0 : _this$$primevue2.value : (_this$$primevue3 = this.$primevue) === null || _this$$primevue3 === void 0 || (_this$$primevue3 = _this$$primevue3.config) === null || _this$$primevue3 === void 0 ? void 0 : _this$$primevue3.pt) || originalValueInConfig) === null || _ref2 === void 0 || (_ref2 = _ref2[this.$.type.name]) === null || _ref2 === void 0 || (_ref2 = _ref2.hooks) === null || _ref2 === void 0 || (_ref2$onBeforeCreate = _ref2["onBeforeCreate"]) === null || _ref2$onBeforeCreate === void 0 || _ref2$onBeforeCreate.call(_ref2);
			this.$attrSelector = useAttrSelector();
			this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
		},
		created: function created() {
			this._hook("onCreated");
		},
		beforeMount: function beforeMount() {
			var _this$$el;
			this.rootEl = findSingle(isElement(this.$el) ? this.$el : (_this$$el = this.$el) === null || _this$$el === void 0 ? void 0 : _this$$el.parentElement, "[".concat(this.$attrSelector, "]"));
			if (this.rootEl) this.rootEl.$pc = _objectSpread$3({
				name: this.$.type.name,
				attrSelector: this.$attrSelector
			}, this.$params);
			this._loadStyles();
			this._hook("onBeforeMount");
		},
		mounted: function mounted() {
			this._hook("onMounted");
		},
		beforeUpdate: function beforeUpdate() {
			this._hook("onBeforeUpdate");
		},
		updated: function updated() {
			this._hook("onUpdated");
		},
		beforeUnmount: function beforeUnmount() {
			this._hook("onBeforeUnmount");
		},
		unmounted: function unmounted() {
			this._removeThemeListeners();
			this._unloadScopedThemeStyles();
			this._hook("onUnmounted");
		},
		methods: {
			_hook: function _hook(hookName) {
				if (!this.$options.hostName) {
					var selfHook = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(hookName));
					var defaultHook = this._useDefaultPT(this._getOptionValue, "hooks.".concat(hookName));
					selfHook === null || selfHook === void 0 || selfHook();
					defaultHook === null || defaultHook === void 0 || defaultHook();
				}
			},
			_mergeProps: function _mergeProps(fn) {
				for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) args[_key2 - 1] = arguments[_key2];
				return isFunction(fn) ? fn.apply(void 0, args) : vue.mergeProps.apply(void 0, args);
			},
			_load: function _load() {
				if (!Base.isStyleNameLoaded("base")) {
					BaseStyle.loadCSS(this.$styleOptions);
					this._loadGlobalStyles();
					Base.setLoadedStyleName("base");
				}
				this._loadThemeStyles();
			},
			_loadStyles: function _loadStyles() {
				this._load();
				this._themeChangeListener(this._load);
			},
			_loadCoreStyles: function _loadCoreStyles() {
				var _this$$style, _this$$style2;
				if (!Base.isStyleNameLoaded((_this$$style = this.$style) === null || _this$$style === void 0 ? void 0 : _this$$style.name) && (_this$$style2 = this.$style) !== null && _this$$style2 !== void 0 && _this$$style2.name) {
					BaseComponentStyle.loadCSS(this.$styleOptions);
					this.$options.style && this.$style.loadCSS(this.$styleOptions);
					Base.setLoadedStyleName(this.$style.name);
				}
			},
			_loadGlobalStyles: function _loadGlobalStyles() {
				var globalCSS = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
				isNotEmpty(globalCSS) && BaseStyle.load(globalCSS, _objectSpread$3({ name: "global" }, this.$styleOptions));
			},
			_loadThemeStyles: function _loadThemeStyles() {
				var _this$$style4, _this$$style5;
				if (this.isUnstyled || this.$theme === "none") return;
				if (!config_default.isStyleNameLoaded("common")) {
					var _this$$style3, _this$$style3$getComm;
					var _ref3 = ((_this$$style3 = this.$style) === null || _this$$style3 === void 0 || (_this$$style3$getComm = _this$$style3.getCommonTheme) === null || _this$$style3$getComm === void 0 ? void 0 : _this$$style3$getComm.call(_this$$style3)) || {}, primitive = _ref3.primitive, semantic = _ref3.semantic, global = _ref3.global, style = _ref3.style;
					BaseStyle.load(primitive === null || primitive === void 0 ? void 0 : primitive.css, _objectSpread$3({ name: "primitive-variables" }, this.$styleOptions));
					BaseStyle.load(semantic === null || semantic === void 0 ? void 0 : semantic.css, _objectSpread$3({ name: "semantic-variables" }, this.$styleOptions));
					BaseStyle.load(global === null || global === void 0 ? void 0 : global.css, _objectSpread$3({ name: "global-variables" }, this.$styleOptions));
					BaseStyle.loadStyle(_objectSpread$3({ name: "global-style" }, this.$styleOptions), style);
					config_default.setLoadedStyleName("common");
				}
				if (!config_default.isStyleNameLoaded((_this$$style4 = this.$style) === null || _this$$style4 === void 0 ? void 0 : _this$$style4.name) && (_this$$style5 = this.$style) !== null && _this$$style5 !== void 0 && _this$$style5.name) {
					var _this$$style6, _this$$style6$getComp, _this$$style7, _this$$style8;
					var _ref4 = ((_this$$style6 = this.$style) === null || _this$$style6 === void 0 || (_this$$style6$getComp = _this$$style6.getComponentTheme) === null || _this$$style6$getComp === void 0 ? void 0 : _this$$style6$getComp.call(_this$$style6)) || {}, css = _ref4.css, _style = _ref4.style;
					(_this$$style7 = this.$style) === null || _this$$style7 === void 0 || _this$$style7.load(css, _objectSpread$3({ name: "".concat(this.$style.name, "-variables") }, this.$styleOptions));
					(_this$$style8 = this.$style) === null || _this$$style8 === void 0 || _this$$style8.loadStyle(_objectSpread$3({ name: "".concat(this.$style.name, "-style") }, this.$styleOptions), _style);
					config_default.setLoadedStyleName(this.$style.name);
				}
				if (!config_default.isStyleNameLoaded("layer-order")) {
					var _this$$style9, _this$$style9$getLaye;
					var layerOrder = (_this$$style9 = this.$style) === null || _this$$style9 === void 0 || (_this$$style9$getLaye = _this$$style9.getLayerOrderThemeCSS) === null || _this$$style9$getLaye === void 0 ? void 0 : _this$$style9$getLaye.call(_this$$style9);
					BaseStyle.load(layerOrder, _objectSpread$3({
						name: "layer-order",
						first: true
					}, this.$styleOptions));
					config_default.setLoadedStyleName("layer-order");
				}
			},
			_loadScopedThemeStyles: function _loadScopedThemeStyles(preset) {
				var _this$$style0, _this$$style0$getPres, _this$$style1;
				var css = (((_this$$style0 = this.$style) === null || _this$$style0 === void 0 || (_this$$style0$getPres = _this$$style0.getPresetTheme) === null || _this$$style0$getPres === void 0 ? void 0 : _this$$style0$getPres.call(_this$$style0, preset, "[".concat(this.$attrSelector, "]"))) || {}).css;
				var scopedStyle = (_this$$style1 = this.$style) === null || _this$$style1 === void 0 ? void 0 : _this$$style1.load(css, _objectSpread$3({ name: "".concat(this.$attrSelector, "-").concat(this.$style.name) }, this.$styleOptions));
				this.scopedStyleEl = scopedStyle.el;
			},
			_unloadScopedThemeStyles: function _unloadScopedThemeStyles() {
				var _this$scopedStyleEl;
				(_this$scopedStyleEl = this.scopedStyleEl) === null || _this$scopedStyleEl === void 0 || (_this$scopedStyleEl = _this$scopedStyleEl.value) === null || _this$scopedStyleEl === void 0 || _this$scopedStyleEl.remove();
			},
			_themeChangeListener: function _themeChangeListener() {
				var callback = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {};
				Base.clearLoadedStyleNames();
				ThemeService.on("theme:change", callback);
			},
			_removeThemeListeners: function _removeThemeListeners() {
				ThemeService.off("theme:change", this._loadCoreStyles);
				ThemeService.off("theme:change", this._load);
				ThemeService.off("theme:change", this._themeScopedListener);
			},
			_getHostInstance: function _getHostInstance(instance) {
				return instance ? this.$options.hostName ? instance.$.type.name === this.$options.hostName ? instance : this._getHostInstance(instance.$parentInstance) : instance.$parentInstance : void 0;
			},
			_getPropValue: function _getPropValue(name) {
				var _this$_getHostInstanc;
				return this[name] || ((_this$_getHostInstanc = this._getHostInstance(this)) === null || _this$_getHostInstanc === void 0 ? void 0 : _this$_getHostInstanc[name]);
			},
			_getOptionValue: function _getOptionValue(options) {
				return getKeyValue(options, arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {});
			},
			_getPTValue: function _getPTValue() {
				var _this$$primevueConfig2;
				var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
				var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
				var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
				var searchInDefaultPT = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
				var searchOut = /./g.test(key) && !!params[key.split(".")[0]];
				var _ref6 = this._getPropValue("ptOptions") || ((_this$$primevueConfig2 = this.$primevueConfig) === null || _this$$primevueConfig2 === void 0 ? void 0 : _this$$primevueConfig2.ptOptions) || {}, _ref6$mergeSections = _ref6.mergeSections, mergeSections = _ref6$mergeSections === void 0 ? true : _ref6$mergeSections, _ref6$mergeProps = _ref6.mergeProps, useMergeProps = _ref6$mergeProps === void 0 ? false : _ref6$mergeProps;
				var global = searchInDefaultPT ? searchOut ? this._useGlobalPT(this._getPTClassValue, key, params) : this._useDefaultPT(this._getPTClassValue, key, params) : void 0;
				var self = searchOut ? void 0 : this._getPTSelf(obj, this._getPTClassValue, key, _objectSpread$3(_objectSpread$3({}, params), {}, { global: global || {} }));
				var datasets = this._getPTDatasets(key);
				return mergeSections || !mergeSections && self ? useMergeProps ? this._mergeProps(useMergeProps, global, self, datasets) : _objectSpread$3(_objectSpread$3(_objectSpread$3({}, global), self), datasets) : _objectSpread$3(_objectSpread$3({}, self), datasets);
			},
			_getPTSelf: function _getPTSelf() {
				var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
				for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key3 = 1; _key3 < _len2; _key3++) args[_key3 - 1] = arguments[_key3];
				return (0, vue.mergeProps)(this._usePT.apply(this, [this._getPT(obj, this.$name)].concat(args)), this._usePT.apply(this, [this.$_attrsPT].concat(args)));
			},
			_getPTDatasets: function _getPTDatasets() {
				var _this$pt4, _this$pt5;
				var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				var datasetPrefix = "data-pc-";
				var isExtended = key === "root" && isNotEmpty((_this$pt4 = this.pt) === null || _this$pt4 === void 0 ? void 0 : _this$pt4["data-pc-section"]);
				return key !== "transition" && _objectSpread$3(_objectSpread$3({}, key === "root" && _objectSpread$3(_objectSpread$3(_defineProperty$7({}, "".concat(datasetPrefix, "name"), toFlatCase(isExtended ? (_this$pt5 = this.pt) === null || _this$pt5 === void 0 ? void 0 : _this$pt5["data-pc-section"] : this.$.type.name)), isExtended && _defineProperty$7({}, "".concat(datasetPrefix, "extend"), toFlatCase(this.$.type.name))), {}, _defineProperty$7({}, "".concat(this.$attrSelector), ""))), {}, _defineProperty$7({}, "".concat(datasetPrefix, "section"), toFlatCase(key)));
			},
			_getPTClassValue: function _getPTClassValue() {
				var value = this._getOptionValue.apply(this, arguments);
				return isString(value) || isArray(value) ? { "class": value } : value;
			},
			_getPT: function _getPT(pt) {
				var _this2 = this;
				var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
				var callback = arguments.length > 2 ? arguments[2] : void 0;
				var getValue = function getValue(value) {
					var _ref8;
					var checkSameKey = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
					var computedValue = callback ? callback(value) : value;
					var _key = toFlatCase(key);
					var _cKey = toFlatCase(_this2.$name);
					return (_ref8 = checkSameKey ? _key !== _cKey ? computedValue === null || computedValue === void 0 ? void 0 : computedValue[_key] : void 0 : computedValue === null || computedValue === void 0 ? void 0 : computedValue[_key]) !== null && _ref8 !== void 0 ? _ref8 : computedValue;
				};
				return pt !== null && pt !== void 0 && pt.hasOwnProperty("_usept") ? {
					_usept: pt["_usept"],
					originalValue: getValue(pt.originalValue),
					value: getValue(pt.value)
				} : getValue(pt, true);
			},
			_usePT: function _usePT(pt, callback, key, params) {
				var fn = function fn(value) {
					return callback(value, key, params);
				};
				if (pt !== null && pt !== void 0 && pt.hasOwnProperty("_usept")) {
					var _this$$primevueConfig3;
					var _ref9 = pt["_usept"] || ((_this$$primevueConfig3 = this.$primevueConfig) === null || _this$$primevueConfig3 === void 0 ? void 0 : _this$$primevueConfig3.ptOptions) || {}, _ref9$mergeSections = _ref9.mergeSections, mergeSections = _ref9$mergeSections === void 0 ? true : _ref9$mergeSections, _ref9$mergeProps = _ref9.mergeProps, useMergeProps = _ref9$mergeProps === void 0 ? false : _ref9$mergeProps;
					var originalValue = fn(pt.originalValue);
					var value = fn(pt.value);
					if (originalValue === void 0 && value === void 0) return void 0;
					else if (isString(value)) return value;
					else if (isString(originalValue)) return originalValue;
					return mergeSections || !mergeSections && value ? useMergeProps ? this._mergeProps(useMergeProps, originalValue, value) : _objectSpread$3(_objectSpread$3({}, originalValue), value) : value;
				}
				return fn(pt);
			},
			_useGlobalPT: function _useGlobalPT(callback, key, params) {
				return this._usePT(this.globalPT, callback, key, params);
			},
			_useDefaultPT: function _useDefaultPT(callback, key, params) {
				return this._usePT(this.defaultPT, callback, key, params);
			},
			ptm: function ptm() {
				var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
				return this._getPTValue(this.pt, key, _objectSpread$3(_objectSpread$3({}, this.$params), params));
			},
			ptmi: function ptmi() {
				var _attrs$id;
				var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
				var attrs = (0, vue.mergeProps)(this.$_attrsWithoutPT, this.ptm(key, params));
				attrs !== null && attrs !== void 0 && attrs.hasOwnProperty("id") && ((_attrs$id = attrs.id) !== null && _attrs$id !== void 0 || (attrs.id = this.$id));
				return attrs;
			},
			ptmo: function ptmo() {
				var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
				var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
				var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
				return this._getPTValue(obj, key, _objectSpread$3({ instance: this }, params), false);
			},
			cx: function cx() {
				var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
				return !this.isUnstyled ? this._getOptionValue(this.$style.classes, key, _objectSpread$3(_objectSpread$3({}, this.$params), params)) : void 0;
			},
			sx: function sx() {
				var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
				var when = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
				var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
				if (when) {
					var self = this._getOptionValue(this.$style.inlineStyles, key, _objectSpread$3(_objectSpread$3({}, this.$params), params));
					return [this._getOptionValue(BaseComponentStyle.inlineStyles, key, _objectSpread$3(_objectSpread$3({}, this.$params), params)), self];
				}
			}
		},
		computed: {
			globalPT: function globalPT() {
				var _this$$primevueConfig4, _this3 = this;
				return this._getPT((_this$$primevueConfig4 = this.$primevueConfig) === null || _this$$primevueConfig4 === void 0 ? void 0 : _this$$primevueConfig4.pt, void 0, function(value) {
					return resolve(value, { instance: _this3 });
				});
			},
			defaultPT: function defaultPT() {
				var _this$$primevueConfig5, _this4 = this;
				return this._getPT((_this$$primevueConfig5 = this.$primevueConfig) === null || _this$$primevueConfig5 === void 0 ? void 0 : _this$$primevueConfig5.pt, void 0, function(value) {
					return _this4._getOptionValue(value, _this4.$name, _objectSpread$3({}, _this4.$params)) || resolve(value, _objectSpread$3({}, _this4.$params));
				});
			},
			isUnstyled: function isUnstyled() {
				var _this$$primevueConfig6;
				return this.unstyled !== void 0 ? this.unstyled : (_this$$primevueConfig6 = this.$primevueConfig) === null || _this$$primevueConfig6 === void 0 ? void 0 : _this$$primevueConfig6.unstyled;
			},
			$id: function $id() {
				return this.$attrs.id || this.uid;
			},
			$inProps: function $inProps() {
				var _this$$$vnode;
				var nodePropKeys = Object.keys(((_this$$$vnode = this.$.vnode) === null || _this$$$vnode === void 0 ? void 0 : _this$$$vnode.props) || {});
				return Object.fromEntries(Object.entries(this.$props).filter(function(_ref0) {
					var k = _slicedToArray$1(_ref0, 1)[0];
					return nodePropKeys === null || nodePropKeys === void 0 ? void 0 : nodePropKeys.includes(k);
				}));
			},
			$theme: function $theme() {
				var _this$$primevueConfig7;
				return (_this$$primevueConfig7 = this.$primevueConfig) === null || _this$$primevueConfig7 === void 0 ? void 0 : _this$$primevueConfig7.theme;
			},
			$style: function $style() {
				return _objectSpread$3(_objectSpread$3({
					classes: void 0,
					inlineStyles: void 0,
					load: function load() {},
					loadCSS: function loadCSS() {},
					loadStyle: function loadStyle() {}
				}, (this._getHostInstance(this) || {}).$style), this.$options.style);
			},
			$styleOptions: function $styleOptions() {
				var _this$$primevueConfig8;
				return { nonce: (_this$$primevueConfig8 = this.$primevueConfig) === null || _this$$primevueConfig8 === void 0 || (_this$$primevueConfig8 = _this$$primevueConfig8.csp) === null || _this$$primevueConfig8 === void 0 ? void 0 : _this$$primevueConfig8.nonce };
			},
			$primevueConfig: function $primevueConfig() {
				var _this$$primevue4;
				return (_this$$primevue4 = this.$primevue) === null || _this$$primevue4 === void 0 ? void 0 : _this$$primevue4.config;
			},
			$name: function $name() {
				return this.$options.hostName || this.$.type.name;
			},
			$params: function $params() {
				var parentInstance = this._getHostInstance(this) || this.$parent;
				return {
					instance: this,
					props: this.$props,
					state: this.$data,
					attrs: this.$attrs,
					parent: {
						instance: parentInstance,
						props: parentInstance === null || parentInstance === void 0 ? void 0 : parentInstance.$props,
						state: parentInstance === null || parentInstance === void 0 ? void 0 : parentInstance.$data,
						attrs: parentInstance === null || parentInstance === void 0 ? void 0 : parentInstance.$attrs
					}
				};
			},
			$_attrsPT: function $_attrsPT() {
				return Object.entries(this.$attrs || {}).filter(function(_ref10) {
					var key = _slicedToArray$1(_ref10, 1)[0];
					return key === null || key === void 0 ? void 0 : key.startsWith("pt:");
				}).reduce(function(result, _ref12) {
					var _ref13 = _slicedToArray$1(_ref12, 2), key = _ref13[0], value = _ref13[1];
					var rest = _arrayLikeToArray$3(_toArray(key.split(":"))).slice(1);
					rest === null || rest === void 0 || rest.reduce(function(currentObj, nestedKey, index, array) {
						!currentObj[nestedKey] && (currentObj[nestedKey] = index === array.length - 1 ? value : {});
						return currentObj[nestedKey];
					}, result);
					return result;
				}, {});
			},
			$_attrsWithoutPT: function $_attrsWithoutPT() {
				return Object.entries(this.$attrs || {}).filter(function(_ref14) {
					var key = _slicedToArray$1(_ref14, 1)[0];
					return !(key !== null && key !== void 0 && key.startsWith("pt:"));
				}).reduce(function(acc, _ref16) {
					var _ref17 = _slicedToArray$1(_ref16, 2), key = _ref17[0];
					acc[key] = _ref17[1];
					return acc;
				}, {});
			}
		}
	};
	var BaseIconStyle = BaseStyle.extend({
		name: "baseicon",
		css: "\n.p-icon {\n    display: inline-block;\n    vertical-align: baseline;\n    flex-shrink: 0;\n}\n\n.p-icon-spin {\n    -webkit-animation: p-icon-spin 2s infinite linear;\n    animation: p-icon-spin 2s infinite linear;\n}\n\n@-webkit-keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n\n@keyframes p-icon-spin {\n    0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n    }\n    100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n    }\n}\n"
	});
	function _typeof$6(o) {
		"@babel/helpers - typeof";
		return _typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$6(o);
	}
	function ownKeys$2(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread$2(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys$2(Object(t), true).forEach(function(r) {
				_defineProperty$6(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function _defineProperty$6(e, r, t) {
		return (r = _toPropertyKey$6(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$6(t) {
		var i = _toPrimitive$6(t, "string");
		return "symbol" == _typeof$6(i) ? i : i + "";
	}
	function _toPrimitive$6(t, r) {
		if ("object" != _typeof$6(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$6(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var script$3 = {
		name: "SpinnerIcon",
		"extends": {
			name: "BaseIcon",
			"extends": script$5,
			props: {
				label: {
					type: String,
					"default": void 0
				},
				spin: {
					type: Boolean,
					"default": false
				}
			},
			style: BaseIconStyle,
			provide: function provide() {
				return {
					$pcIcon: this,
					$parentInstance: this
				};
			},
			methods: { pti: function pti() {
				var isLabelEmpty = isEmpty(this.label);
				return _objectSpread$2(_objectSpread$2({}, !this.isUnstyled && { "class": ["p-icon", { "p-icon-spin": this.spin }] }), {}, {
					role: !isLabelEmpty ? "img" : void 0,
					"aria-label": !isLabelEmpty ? this.label : void 0,
					"aria-hidden": isLabelEmpty
				});
			} }
		}
	};
	function _toConsumableArray$1(r) {
		return _arrayWithoutHoles$1(r) || _iterableToArray$1(r) || _unsupportedIterableToArray$2(r) || _nonIterableSpread$1();
	}
	function _nonIterableSpread$1() {
		throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray$2(r, a) {
		if (r) {
			if ("string" == typeof r) return _arrayLikeToArray$2(r, a);
			var t = {}.toString.call(r).slice(8, -1);
			return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0;
		}
	}
	function _iterableToArray$1(r) {
		if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}
	function _arrayWithoutHoles$1(r) {
		if (Array.isArray(r)) return _arrayLikeToArray$2(r);
	}
	function _arrayLikeToArray$2(r, a) {
		(null == a || a > r.length) && (a = r.length);
		for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
		return n;
	}
	function render$2(_ctx, _cache, $props, $setup, $data, $options) {
		return (0, vue.openBlock)(), (0, vue.createElementBlock)("svg", (0, vue.mergeProps)({
			width: "14",
			height: "14",
			viewBox: "0 0 14 14",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg"
		}, _ctx.pti()), _toConsumableArray$1(_cache[0] || (_cache[0] = [(0, vue.createElementVNode)("path", {
			d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
			fill: "currentColor"
		}, null, -1)])), 16);
	}
	script$3.render = render$2;
	var BadgeStyle = BaseStyle.extend({
		name: "badge",
		style: `
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`,
		classes: { root: function root(_ref) {
			var props = _ref.props, instance = _ref.instance;
			return ["p-badge p-component", {
				"p-badge-circle": isNotEmpty(props.value) && String(props.value).length === 1,
				"p-badge-dot": isEmpty(props.value) && !instance.$slots["default"],
				"p-badge-sm": props.size === "small",
				"p-badge-lg": props.size === "large",
				"p-badge-xl": props.size === "xlarge",
				"p-badge-info": props.severity === "info",
				"p-badge-success": props.severity === "success",
				"p-badge-warn": props.severity === "warn",
				"p-badge-danger": props.severity === "danger",
				"p-badge-secondary": props.severity === "secondary",
				"p-badge-contrast": props.severity === "contrast"
			}];
		} }
	});
	var script$1$1 = {
		name: "BaseBadge",
		"extends": script$5,
		props: {
			value: {
				type: [String, Number],
				"default": null
			},
			severity: {
				type: String,
				"default": null
			},
			size: {
				type: String,
				"default": null
			}
		},
		style: BadgeStyle,
		provide: function provide() {
			return {
				$pcBadge: this,
				$parentInstance: this
			};
		}
	};
	function _typeof$5(o) {
		"@babel/helpers - typeof";
		return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$5(o);
	}
	function _defineProperty$5(e, r, t) {
		return (r = _toPropertyKey$5(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$5(t) {
		var i = _toPrimitive$5(t, "string");
		return "symbol" == _typeof$5(i) ? i : i + "";
	}
	function _toPrimitive$5(t, r) {
		if ("object" != _typeof$5(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$5(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var script$2 = {
		name: "Badge",
		"extends": script$1$1,
		inheritAttrs: false,
		computed: { dataP: function dataP() {
			return cn(_defineProperty$5(_defineProperty$5({
				circle: this.value != null && String(this.value).length === 1,
				empty: this.value == null && !this.$slots["default"]
			}, this.severity, this.severity), this.size, this.size));
		} }
	};
	var _hoisted_1$1 = ["data-p"];
	function render$1(_ctx, _cache, $props, $setup, $data, $options) {
		return (0, vue.openBlock)(), (0, vue.createElementBlock)("span", (0, vue.mergeProps)({
			"class": _ctx.cx("root"),
			"data-p": $options.dataP
		}, _ctx.ptmi("root")), [(0, vue.renderSlot)(_ctx.$slots, "default", {}, function() {
			return [(0, vue.createTextVNode)((0, vue.toDisplayString)(_ctx.value), 1)];
		})], 16, _hoisted_1$1);
	}
	script$2.render = render$1;
	var PrimeVueService = EventBus();
	function _typeof$4(o) {
		"@babel/helpers - typeof";
		return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$4(o);
	}
	function _slicedToArray(r, e) {
		return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest();
	}
	function _nonIterableRest() {
		throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray$1(r, a) {
		if (r) {
			if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
			var t = {}.toString.call(r).slice(8, -1);
			return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
		}
	}
	function _arrayLikeToArray$1(r, a) {
		(null == a || a > r.length) && (a = r.length);
		for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
		return n;
	}
	function _iterableToArrayLimit(r, l) {
		var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
		if (null != t) {
			var e, n, i, u, a = [], f = true, o = false;
			try {
				if (i = (t = t.call(r)).next, 0 === l);
				else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
			} catch (r) {
				o = true, n = r;
			} finally {
				try {
					if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
				} finally {
					if (o) throw n;
				}
			}
			return a;
		}
	}
	function _arrayWithHoles(r) {
		if (Array.isArray(r)) return r;
	}
	function ownKeys$1(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread$1(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys$1(Object(t), true).forEach(function(r) {
				_defineProperty$4(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function _defineProperty$4(e, r, t) {
		return (r = _toPropertyKey$4(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$4(t) {
		var i = _toPrimitive$4(t, "string");
		return "symbol" == _typeof$4(i) ? i : i + "";
	}
	function _toPrimitive$4(t, r) {
		if ("object" != _typeof$4(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$4(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var BaseDirective = {
		_getMeta: function _getMeta() {
			return [isObject(arguments.length <= 0 ? void 0 : arguments[0]) ? void 0 : arguments.length <= 0 ? void 0 : arguments[0], resolve(isObject(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
		},
		_getConfig: function _getConfig(binding, vnode) {
			var _ref, _binding$instance, _vnode$ctx;
			return (_ref = (binding === null || binding === void 0 || (_binding$instance = binding.instance) === null || _binding$instance === void 0 ? void 0 : _binding$instance.$primevue) || (vnode === null || vnode === void 0 || (_vnode$ctx = vnode.ctx) === null || _vnode$ctx === void 0 || (_vnode$ctx = _vnode$ctx.appContext) === null || _vnode$ctx === void 0 || (_vnode$ctx = _vnode$ctx.config) === null || _vnode$ctx === void 0 || (_vnode$ctx = _vnode$ctx.globalProperties) === null || _vnode$ctx === void 0 ? void 0 : _vnode$ctx.$primevue)) === null || _ref === void 0 ? void 0 : _ref.config;
		},
		_getOptionValue: getKeyValue,
		_getPTValue: function _getPTValue() {
			var _instance$binding, _instance$$primevueCo;
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var obj = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			var key = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
			var params = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
			var searchInDefaultPT = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
			var getValue = function getValue() {
				var value = BaseDirective._getOptionValue.apply(BaseDirective, arguments);
				return isString(value) || isArray(value) ? { "class": value } : value;
			};
			var _ref2 = ((_instance$binding = instance.binding) === null || _instance$binding === void 0 || (_instance$binding = _instance$binding.value) === null || _instance$binding === void 0 ? void 0 : _instance$binding.ptOptions) || ((_instance$$primevueCo = instance.$primevueConfig) === null || _instance$$primevueCo === void 0 ? void 0 : _instance$$primevueCo.ptOptions) || {}, _ref2$mergeSections = _ref2.mergeSections, mergeSections = _ref2$mergeSections === void 0 ? true : _ref2$mergeSections, _ref2$mergeProps = _ref2.mergeProps, useMergeProps = _ref2$mergeProps === void 0 ? false : _ref2$mergeProps;
			var global = searchInDefaultPT ? BaseDirective._useDefaultPT(instance, instance.defaultPT(), getValue, key, params) : void 0;
			var self = BaseDirective._usePT(instance, BaseDirective._getPT(obj, instance.$name), getValue, key, _objectSpread$1(_objectSpread$1({}, params), {}, { global: global || {} }));
			var datasets = BaseDirective._getPTDatasets(instance, key);
			return mergeSections || !mergeSections && self ? useMergeProps ? BaseDirective._mergeProps(instance, useMergeProps, global, self, datasets) : _objectSpread$1(_objectSpread$1(_objectSpread$1({}, global), self), datasets) : _objectSpread$1(_objectSpread$1({}, self), datasets);
		},
		_getPTDatasets: function _getPTDatasets() {
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
			var datasetPrefix = "data-pc-";
			return _objectSpread$1(_objectSpread$1({}, key === "root" && _defineProperty$4({}, "".concat(datasetPrefix, "name"), toFlatCase(instance.$name))), {}, _defineProperty$4({}, "".concat(datasetPrefix, "section"), toFlatCase(key)));
		},
		_getPT: function _getPT(pt) {
			var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
			var callback = arguments.length > 2 ? arguments[2] : void 0;
			var getValue = function getValue(value) {
				var _computedValue$_key;
				var computedValue = callback ? callback(value) : value;
				var _key = toFlatCase(key);
				return (_computedValue$_key = computedValue === null || computedValue === void 0 ? void 0 : computedValue[_key]) !== null && _computedValue$_key !== void 0 ? _computedValue$_key : computedValue;
			};
			return pt && Object.hasOwn(pt, "_usept") ? {
				_usept: pt["_usept"],
				originalValue: getValue(pt.originalValue),
				value: getValue(pt.value)
			} : getValue(pt);
		},
		_usePT: function _usePT() {
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var pt = arguments.length > 1 ? arguments[1] : void 0;
			var callback = arguments.length > 2 ? arguments[2] : void 0;
			var key = arguments.length > 3 ? arguments[3] : void 0;
			var params = arguments.length > 4 ? arguments[4] : void 0;
			var fn = function fn(value) {
				return callback(value, key, params);
			};
			if (pt && Object.hasOwn(pt, "_usept")) {
				var _instance$$primevueCo2;
				var _ref4 = pt["_usept"] || ((_instance$$primevueCo2 = instance.$primevueConfig) === null || _instance$$primevueCo2 === void 0 ? void 0 : _instance$$primevueCo2.ptOptions) || {}, _ref4$mergeSections = _ref4.mergeSections, mergeSections = _ref4$mergeSections === void 0 ? true : _ref4$mergeSections, _ref4$mergeProps = _ref4.mergeProps, useMergeProps = _ref4$mergeProps === void 0 ? false : _ref4$mergeProps;
				var originalValue = fn(pt.originalValue);
				var value = fn(pt.value);
				if (originalValue === void 0 && value === void 0) return void 0;
				else if (isString(value)) return value;
				else if (isString(originalValue)) return originalValue;
				return mergeSections || !mergeSections && value ? useMergeProps ? BaseDirective._mergeProps(instance, useMergeProps, originalValue, value) : _objectSpread$1(_objectSpread$1({}, originalValue), value) : value;
			}
			return fn(pt);
		},
		_useDefaultPT: function _useDefaultPT() {
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var defaultPT = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			var callback = arguments.length > 2 ? arguments[2] : void 0;
			var key = arguments.length > 3 ? arguments[3] : void 0;
			var params = arguments.length > 4 ? arguments[4] : void 0;
			return BaseDirective._usePT(instance, defaultPT, callback, key, params);
		},
		_loadStyles: function _loadStyles() {
			var _config$csp;
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var binding = arguments.length > 1 ? arguments[1] : void 0;
			var vnode = arguments.length > 2 ? arguments[2] : void 0;
			var config = BaseDirective._getConfig(binding, vnode);
			var useStyleOptions = { nonce: config === null || config === void 0 || (_config$csp = config.csp) === null || _config$csp === void 0 ? void 0 : _config$csp.nonce };
			BaseDirective._loadCoreStyles(instance, useStyleOptions);
			BaseDirective._loadThemeStyles(instance, useStyleOptions);
			BaseDirective._loadScopedThemeStyles(instance, useStyleOptions);
			BaseDirective._removeThemeListeners(instance);
			instance.$loadStyles = function() {
				return BaseDirective._loadThemeStyles(instance, useStyleOptions);
			};
			BaseDirective._themeChangeListener(instance.$loadStyles);
		},
		_loadCoreStyles: function _loadCoreStyles() {
			var _instance$$style, _instance$$style2;
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var useStyleOptions = arguments.length > 1 ? arguments[1] : void 0;
			if (!Base.isStyleNameLoaded((_instance$$style = instance.$style) === null || _instance$$style === void 0 ? void 0 : _instance$$style.name) && (_instance$$style2 = instance.$style) !== null && _instance$$style2 !== void 0 && _instance$$style2.name) {
				var _instance$$style3;
				BaseStyle.loadCSS(useStyleOptions);
				(_instance$$style3 = instance.$style) === null || _instance$$style3 === void 0 || _instance$$style3.loadCSS(useStyleOptions);
				Base.setLoadedStyleName(instance.$style.name);
			}
		},
		_loadThemeStyles: function _loadThemeStyles() {
			var _instance$theme, _instance$$style5, _instance$$style6;
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var useStyleOptions = arguments.length > 1 ? arguments[1] : void 0;
			if (instance !== null && instance !== void 0 && instance.isUnstyled() || (instance === null || instance === void 0 || (_instance$theme = instance.theme) === null || _instance$theme === void 0 ? void 0 : _instance$theme.call(instance)) === "none") return;
			if (!config_default.isStyleNameLoaded("common")) {
				var _instance$$style4, _instance$$style4$get;
				var _ref5 = ((_instance$$style4 = instance.$style) === null || _instance$$style4 === void 0 || (_instance$$style4$get = _instance$$style4.getCommonTheme) === null || _instance$$style4$get === void 0 ? void 0 : _instance$$style4$get.call(_instance$$style4)) || {}, primitive = _ref5.primitive, semantic = _ref5.semantic, global = _ref5.global, style = _ref5.style;
				BaseStyle.load(primitive === null || primitive === void 0 ? void 0 : primitive.css, _objectSpread$1({ name: "primitive-variables" }, useStyleOptions));
				BaseStyle.load(semantic === null || semantic === void 0 ? void 0 : semantic.css, _objectSpread$1({ name: "semantic-variables" }, useStyleOptions));
				BaseStyle.load(global === null || global === void 0 ? void 0 : global.css, _objectSpread$1({ name: "global-variables" }, useStyleOptions));
				BaseStyle.loadStyle(_objectSpread$1({ name: "global-style" }, useStyleOptions), style);
				config_default.setLoadedStyleName("common");
			}
			if (!config_default.isStyleNameLoaded((_instance$$style5 = instance.$style) === null || _instance$$style5 === void 0 ? void 0 : _instance$$style5.name) && (_instance$$style6 = instance.$style) !== null && _instance$$style6 !== void 0 && _instance$$style6.name) {
				var _instance$$style7, _instance$$style7$get, _instance$$style8, _instance$$style9;
				var _ref6 = ((_instance$$style7 = instance.$style) === null || _instance$$style7 === void 0 || (_instance$$style7$get = _instance$$style7.getDirectiveTheme) === null || _instance$$style7$get === void 0 ? void 0 : _instance$$style7$get.call(_instance$$style7)) || {}, css = _ref6.css, _style = _ref6.style;
				(_instance$$style8 = instance.$style) === null || _instance$$style8 === void 0 || _instance$$style8.load(css, _objectSpread$1({ name: "".concat(instance.$style.name, "-variables") }, useStyleOptions));
				(_instance$$style9 = instance.$style) === null || _instance$$style9 === void 0 || _instance$$style9.loadStyle(_objectSpread$1({ name: "".concat(instance.$style.name, "-style") }, useStyleOptions), _style);
				config_default.setLoadedStyleName(instance.$style.name);
			}
			if (!config_default.isStyleNameLoaded("layer-order")) {
				var _instance$$style0, _instance$$style0$get;
				var layerOrder = (_instance$$style0 = instance.$style) === null || _instance$$style0 === void 0 || (_instance$$style0$get = _instance$$style0.getLayerOrderThemeCSS) === null || _instance$$style0$get === void 0 ? void 0 : _instance$$style0$get.call(_instance$$style0);
				BaseStyle.load(layerOrder, _objectSpread$1({
					name: "layer-order",
					first: true
				}, useStyleOptions));
				config_default.setLoadedStyleName("layer-order");
			}
		},
		_loadScopedThemeStyles: function _loadScopedThemeStyles() {
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			var useStyleOptions = arguments.length > 1 ? arguments[1] : void 0;
			var preset = instance.preset();
			if (preset && instance.$attrSelector) {
				var _instance$$style1, _instance$$style1$get, _instance$$style10;
				var css = (((_instance$$style1 = instance.$style) === null || _instance$$style1 === void 0 || (_instance$$style1$get = _instance$$style1.getPresetTheme) === null || _instance$$style1$get === void 0 ? void 0 : _instance$$style1$get.call(_instance$$style1, preset, "[".concat(instance.$attrSelector, "]"))) || {}).css;
				instance.scopedStyleEl = ((_instance$$style10 = instance.$style) === null || _instance$$style10 === void 0 ? void 0 : _instance$$style10.load(css, _objectSpread$1({ name: "".concat(instance.$attrSelector, "-").concat(instance.$style.name) }, useStyleOptions))).el;
			}
		},
		_themeChangeListener: function _themeChangeListener() {
			var callback = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {};
			Base.clearLoadedStyleNames();
			ThemeService.on("theme:change", callback);
		},
		_removeThemeListeners: function _removeThemeListeners() {
			var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
			ThemeService.off("theme:change", instance.$loadStyles);
			instance.$loadStyles = void 0;
		},
		_hook: function _hook(directiveName, hookName, el, binding, vnode, prevVnode) {
			var _binding$value, _config$pt;
			var name = "on".concat(toCapitalCase(hookName));
			var config = BaseDirective._getConfig(binding, vnode);
			var instance = el === null || el === void 0 ? void 0 : el.$instance;
			var selfHook = BaseDirective._usePT(instance, BaseDirective._getPT(binding === null || binding === void 0 || (_binding$value = binding.value) === null || _binding$value === void 0 ? void 0 : _binding$value.pt, directiveName), BaseDirective._getOptionValue, "hooks.".concat(name));
			var defaultHook = BaseDirective._useDefaultPT(instance, config === null || config === void 0 || (_config$pt = config.pt) === null || _config$pt === void 0 || (_config$pt = _config$pt.directives) === null || _config$pt === void 0 ? void 0 : _config$pt[directiveName], BaseDirective._getOptionValue, "hooks.".concat(name));
			var options = {
				el,
				binding,
				vnode,
				prevVnode
			};
			selfHook === null || selfHook === void 0 || selfHook(instance, options);
			defaultHook === null || defaultHook === void 0 || defaultHook(instance, options);
		},
		_mergeProps: function _mergeProps() {
			var fn = arguments.length > 1 ? arguments[1] : void 0;
			for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key2 = 2; _key2 < _len; _key2++) args[_key2 - 2] = arguments[_key2];
			return isFunction(fn) ? fn.apply(void 0, args) : vue.mergeProps.apply(void 0, args);
		},
		_extend: function _extend(name) {
			var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
			var handleHook = function handleHook(hook, el, binding, vnode, prevVnode) {
				var _el$$pd, _el$$instance$hook, _el$$instance, _el$$pd2;
				el._$instances = el._$instances || {};
				var config = BaseDirective._getConfig(binding, vnode);
				var $prevInstance = el._$instances[name] || {};
				var $options = isEmpty($prevInstance) ? _objectSpread$1(_objectSpread$1({}, options), options === null || options === void 0 ? void 0 : options.methods) : {};
				el._$instances[name] = _objectSpread$1(_objectSpread$1({}, $prevInstance), {}, {
					$name: name,
					$host: el,
					$binding: binding,
					$modifiers: binding === null || binding === void 0 ? void 0 : binding.modifiers,
					$value: binding === null || binding === void 0 ? void 0 : binding.value,
					$el: $prevInstance["$el"] || el || void 0,
					$style: _objectSpread$1({
						classes: void 0,
						inlineStyles: void 0,
						load: function load() {},
						loadCSS: function loadCSS() {},
						loadStyle: function loadStyle() {}
					}, options === null || options === void 0 ? void 0 : options.style),
					$primevueConfig: config,
					$attrSelector: (_el$$pd = el.$pd) === null || _el$$pd === void 0 || (_el$$pd = _el$$pd[name]) === null || _el$$pd === void 0 ? void 0 : _el$$pd.attrSelector,
					defaultPT: function defaultPT() {
						return BaseDirective._getPT(config === null || config === void 0 ? void 0 : config.pt, void 0, function(value) {
							var _value$directives;
							return value === null || value === void 0 || (_value$directives = value.directives) === null || _value$directives === void 0 ? void 0 : _value$directives[name];
						});
					},
					isUnstyled: function isUnstyled() {
						var _el$_$instances$name, _el$_$instances$name2;
						return ((_el$_$instances$name = el._$instances[name]) === null || _el$_$instances$name === void 0 || (_el$_$instances$name = _el$_$instances$name.$binding) === null || _el$_$instances$name === void 0 || (_el$_$instances$name = _el$_$instances$name.value) === null || _el$_$instances$name === void 0 ? void 0 : _el$_$instances$name.unstyled) !== void 0 ? (_el$_$instances$name2 = el._$instances[name]) === null || _el$_$instances$name2 === void 0 || (_el$_$instances$name2 = _el$_$instances$name2.$binding) === null || _el$_$instances$name2 === void 0 || (_el$_$instances$name2 = _el$_$instances$name2.value) === null || _el$_$instances$name2 === void 0 ? void 0 : _el$_$instances$name2.unstyled : config === null || config === void 0 ? void 0 : config.unstyled;
					},
					theme: function theme() {
						var _el$_$instances$name3;
						return (_el$_$instances$name3 = el._$instances[name]) === null || _el$_$instances$name3 === void 0 || (_el$_$instances$name3 = _el$_$instances$name3.$primevueConfig) === null || _el$_$instances$name3 === void 0 ? void 0 : _el$_$instances$name3.theme;
					},
					preset: function preset() {
						var _el$_$instances$name4;
						return (_el$_$instances$name4 = el._$instances[name]) === null || _el$_$instances$name4 === void 0 || (_el$_$instances$name4 = _el$_$instances$name4.$binding) === null || _el$_$instances$name4 === void 0 || (_el$_$instances$name4 = _el$_$instances$name4.value) === null || _el$_$instances$name4 === void 0 ? void 0 : _el$_$instances$name4.dt;
					},
					ptm: function ptm() {
						var _el$_$instances$name5;
						var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
						var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
						return BaseDirective._getPTValue(el._$instances[name], (_el$_$instances$name5 = el._$instances[name]) === null || _el$_$instances$name5 === void 0 || (_el$_$instances$name5 = _el$_$instances$name5.$binding) === null || _el$_$instances$name5 === void 0 || (_el$_$instances$name5 = _el$_$instances$name5.value) === null || _el$_$instances$name5 === void 0 ? void 0 : _el$_$instances$name5.pt, key, _objectSpread$1({}, params));
					},
					ptmo: function ptmo() {
						var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
						var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
						var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
						return BaseDirective._getPTValue(el._$instances[name], obj, key, params, false);
					},
					cx: function cx() {
						var _el$_$instances$name6, _el$_$instances$name7;
						var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
						var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
						return !((_el$_$instances$name6 = el._$instances[name]) !== null && _el$_$instances$name6 !== void 0 && _el$_$instances$name6.isUnstyled()) ? BaseDirective._getOptionValue((_el$_$instances$name7 = el._$instances[name]) === null || _el$_$instances$name7 === void 0 || (_el$_$instances$name7 = _el$_$instances$name7.$style) === null || _el$_$instances$name7 === void 0 ? void 0 : _el$_$instances$name7.classes, key, _objectSpread$1({}, params)) : void 0;
					},
					sx: function sx() {
						var _el$_$instances$name8;
						var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
						var when = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
						var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
						return when ? BaseDirective._getOptionValue((_el$_$instances$name8 = el._$instances[name]) === null || _el$_$instances$name8 === void 0 || (_el$_$instances$name8 = _el$_$instances$name8.$style) === null || _el$_$instances$name8 === void 0 ? void 0 : _el$_$instances$name8.inlineStyles, key, _objectSpread$1({}, params)) : void 0;
					}
				}, $options);
				el.$instance = el._$instances[name];
				(_el$$instance$hook = (_el$$instance = el.$instance)[hook]) === null || _el$$instance$hook === void 0 || _el$$instance$hook.call(_el$$instance, el, binding, vnode, prevVnode);
				el["$".concat(name)] = el.$instance;
				BaseDirective._hook(name, hook, el, binding, vnode, prevVnode);
				el.$pd || (el.$pd = {});
				el.$pd[name] = _objectSpread$1(_objectSpread$1({}, (_el$$pd2 = el.$pd) === null || _el$$pd2 === void 0 ? void 0 : _el$$pd2[name]), {}, {
					name,
					instance: el._$instances[name]
				});
			};
			var handleWatchers = function handleWatchers(el) {
				var _watchers$config2, _watchers$configRipp2, _instance$$primevueCo3;
				var instance = el._$instances[name];
				var watchers = instance === null || instance === void 0 ? void 0 : instance.watch;
				var handleWatchConfig = function handleWatchConfig(_ref8) {
					var _watchers$config;
					var newValue = _ref8.newValue, oldValue = _ref8.oldValue;
					return watchers === null || watchers === void 0 || (_watchers$config = watchers["config"]) === null || _watchers$config === void 0 ? void 0 : _watchers$config.call(instance, newValue, oldValue);
				};
				var handleWatchConfigRipple = function handleWatchConfigRipple(_ref9) {
					var _watchers$configRipp;
					var newValue = _ref9.newValue, oldValue = _ref9.oldValue;
					return watchers === null || watchers === void 0 || (_watchers$configRipp = watchers["config.ripple"]) === null || _watchers$configRipp === void 0 ? void 0 : _watchers$configRipp.call(instance, newValue, oldValue);
				};
				instance.$watchersCallback = {
					config: handleWatchConfig,
					"config.ripple": handleWatchConfigRipple
				};
				watchers === null || watchers === void 0 || (_watchers$config2 = watchers["config"]) === null || _watchers$config2 === void 0 || _watchers$config2.call(instance, instance === null || instance === void 0 ? void 0 : instance.$primevueConfig);
				PrimeVueService.on("config:change", handleWatchConfig);
				watchers === null || watchers === void 0 || (_watchers$configRipp2 = watchers["config.ripple"]) === null || _watchers$configRipp2 === void 0 || _watchers$configRipp2.call(instance, instance === null || instance === void 0 || (_instance$$primevueCo3 = instance.$primevueConfig) === null || _instance$$primevueCo3 === void 0 ? void 0 : _instance$$primevueCo3.ripple);
				PrimeVueService.on("config:ripple:change", handleWatchConfigRipple);
			};
			var stopWatchers = function stopWatchers(el) {
				var watchers = el._$instances[name].$watchersCallback;
				if (watchers) {
					PrimeVueService.off("config:change", watchers.config);
					PrimeVueService.off("config:ripple:change", watchers["config.ripple"]);
					el._$instances[name].$watchersCallback = void 0;
				}
			};
			return {
				created: function created(el, binding, vnode, prevVnode) {
					el.$pd || (el.$pd = {});
					el.$pd[name] = {
						name,
						attrSelector: uuid("pd")
					};
					handleHook("created", el, binding, vnode, prevVnode);
				},
				beforeMount: function beforeMount(el, binding, vnode, prevVnode) {
					var _el$$pd$name;
					BaseDirective._loadStyles((_el$$pd$name = el.$pd[name]) === null || _el$$pd$name === void 0 ? void 0 : _el$$pd$name.instance, binding, vnode);
					handleHook("beforeMount", el, binding, vnode, prevVnode);
					handleWatchers(el);
				},
				mounted: function mounted(el, binding, vnode, prevVnode) {
					var _el$$pd$name2;
					BaseDirective._loadStyles((_el$$pd$name2 = el.$pd[name]) === null || _el$$pd$name2 === void 0 ? void 0 : _el$$pd$name2.instance, binding, vnode);
					handleHook("mounted", el, binding, vnode, prevVnode);
				},
				beforeUpdate: function beforeUpdate(el, binding, vnode, prevVnode) {
					handleHook("beforeUpdate", el, binding, vnode, prevVnode);
				},
				updated: function updated(el, binding, vnode, prevVnode) {
					var _el$$pd$name3;
					BaseDirective._loadStyles((_el$$pd$name3 = el.$pd[name]) === null || _el$$pd$name3 === void 0 ? void 0 : _el$$pd$name3.instance, binding, vnode);
					handleHook("updated", el, binding, vnode, prevVnode);
				},
				beforeUnmount: function beforeUnmount(el, binding, vnode, prevVnode) {
					var _el$$pd$name4;
					stopWatchers(el);
					BaseDirective._removeThemeListeners((_el$$pd$name4 = el.$pd[name]) === null || _el$$pd$name4 === void 0 ? void 0 : _el$$pd$name4.instance);
					handleHook("beforeUnmount", el, binding, vnode, prevVnode);
				},
				unmounted: function unmounted(el, binding, vnode, prevVnode) {
					var _el$$pd$name5;
					(_el$$pd$name5 = el.$pd[name]) === null || _el$$pd$name5 === void 0 || (_el$$pd$name5 = _el$$pd$name5.instance) === null || _el$$pd$name5 === void 0 || (_el$$pd$name5 = _el$$pd$name5.scopedStyleEl) === null || _el$$pd$name5 === void 0 || (_el$$pd$name5 = _el$$pd$name5.value) === null || _el$$pd$name5 === void 0 || _el$$pd$name5.remove();
					handleHook("unmounted", el, binding, vnode, prevVnode);
				}
			};
		},
		extend: function extend() {
			var _BaseDirective$_getMe2 = _slicedToArray(BaseDirective._getMeta.apply(BaseDirective, arguments), 2), name = _BaseDirective$_getMe2[0], options = _BaseDirective$_getMe2[1];
			return _objectSpread$1({ extend: function extend() {
				var _BaseDirective$_getMe4 = _slicedToArray(BaseDirective._getMeta.apply(BaseDirective, arguments), 2), _name = _BaseDirective$_getMe4[0], _options = _BaseDirective$_getMe4[1];
				return BaseDirective.extend(_name, _objectSpread$1(_objectSpread$1(_objectSpread$1({}, options), options === null || options === void 0 ? void 0 : options.methods), _options));
			} }, BaseDirective._extend(name, options));
		}
	};
	var RippleStyle = BaseStyle.extend({
		name: "ripple-directive",
		style: `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`,
		classes: { root: "p-ink" }
	});
	var BaseRipple = BaseDirective.extend({ style: RippleStyle });
	function _typeof$3(o) {
		"@babel/helpers - typeof";
		return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$3(o);
	}
	function _toConsumableArray(r) {
		return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
	}
	function _nonIterableSpread() {
		throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray(r, a) {
		if (r) {
			if ("string" == typeof r) return _arrayLikeToArray(r, a);
			var t = {}.toString.call(r).slice(8, -1);
			return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
		}
	}
	function _iterableToArray(r) {
		if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}
	function _arrayWithoutHoles(r) {
		if (Array.isArray(r)) return _arrayLikeToArray(r);
	}
	function _arrayLikeToArray(r, a) {
		(null == a || a > r.length) && (a = r.length);
		for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
		return n;
	}
	function _defineProperty$3(e, r, t) {
		return (r = _toPropertyKey$3(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$3(t) {
		var i = _toPrimitive$3(t, "string");
		return "symbol" == _typeof$3(i) ? i : i + "";
	}
	function _toPrimitive$3(t, r) {
		if ("object" != _typeof$3(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$3(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var Ripple = BaseRipple.extend("ripple", {
		watch: { "config.ripple": function configRipple(newValue) {
			if (newValue) {
				this.createRipple(this.$host);
				this.bindEvents(this.$host);
				this.$host.setAttribute("data-pd-ripple", true);
				this.$host.style["overflow"] = "hidden";
				this.$host.style["position"] = "relative";
			} else {
				this.remove(this.$host);
				this.$host.removeAttribute("data-pd-ripple");
			}
		} },
		unmounted: function unmounted(el) {
			this.remove(el);
		},
		timeout: void 0,
		methods: {
			bindEvents: function bindEvents(el) {
				el.addEventListener("mousedown", this.onMouseDown.bind(this));
			},
			unbindEvents: function unbindEvents(el) {
				el.removeEventListener("mousedown", this.onMouseDown.bind(this));
			},
			createRipple: function createRipple(el) {
				var ink = this.getInk(el);
				if (!ink) {
					ink = createElement("span", _defineProperty$3(_defineProperty$3({
						role: "presentation",
						"aria-hidden": true,
						"data-p-ink": true,
						"data-p-ink-active": false,
						"class": !this.isUnstyled() && this.cx("root"),
						onAnimationEnd: this.onAnimationEnd.bind(this)
					}, this.$attrSelector, ""), "p-bind", this.ptm("root")));
					el.appendChild(ink);
					this.$el = ink;
				}
			},
			remove: function remove(el) {
				var ink = this.getInk(el);
				if (ink) {
					this.$host.style["overflow"] = "";
					this.$host.style["position"] = "";
					this.unbindEvents(el);
					ink.removeEventListener("animationend", this.onAnimationEnd);
					ink.remove();
				}
			},
			onMouseDown: function onMouseDown(event) {
				var _this = this;
				var target = event.currentTarget;
				var ink = this.getInk(target);
				if (!ink || getComputedStyle(ink, null).display === "none") return;
				!this.isUnstyled() && removeClass(ink, "p-ink-active");
				ink.setAttribute("data-p-ink-active", "false");
				if (!getHeight(ink) && !getWidth(ink)) {
					var d = Math.max(getOuterWidth(target), getOuterHeight(target));
					ink.style.height = d + "px";
					ink.style.width = d + "px";
				}
				var offset = getOffset(target);
				var x = event.pageX - offset.left + document.body.scrollTop - getWidth(ink) / 2;
				var y = event.pageY - offset.top + document.body.scrollLeft - getHeight(ink) / 2;
				ink.style.top = y + "px";
				ink.style.left = x + "px";
				!this.isUnstyled() && addClass(ink, "p-ink-active");
				ink.setAttribute("data-p-ink-active", "true");
				this.timeout = setTimeout(function() {
					if (ink) {
						!_this.isUnstyled() && removeClass(ink, "p-ink-active");
						ink.setAttribute("data-p-ink-active", "false");
					}
				}, 401);
			},
			onAnimationEnd: function onAnimationEnd(event) {
				if (this.timeout) clearTimeout(this.timeout);
				!this.isUnstyled() && removeClass(event.currentTarget, "p-ink-active");
				event.currentTarget.setAttribute("data-p-ink-active", "false");
			},
			getInk: function getInk(el) {
				return el && el.children ? _toConsumableArray(el.children).find(function(child) {
					return getAttribute(child, "data-pc-name") === "ripple";
				}) : void 0;
			}
		}
	});
	var style = `
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: "\u00A0";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;
	function _typeof$2(o) {
		"@babel/helpers - typeof";
		return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$2(o);
	}
	function _defineProperty$2(e, r, t) {
		return (r = _toPropertyKey$2(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$2(t) {
		var i = _toPrimitive$2(t, "string");
		return "symbol" == _typeof$2(i) ? i : i + "";
	}
	function _toPrimitive$2(t, r) {
		if ("object" != _typeof$2(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$2(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var ButtonStyle = BaseStyle.extend({
		name: "button",
		style,
		classes: {
			root: function root(_ref) {
				var instance = _ref.instance, props = _ref.props;
				return ["p-button p-component", _defineProperty$2(_defineProperty$2(_defineProperty$2(_defineProperty$2(_defineProperty$2(_defineProperty$2(_defineProperty$2(_defineProperty$2(_defineProperty$2({
					"p-button-icon-only": instance.hasIcon && !props.label && !props.badge,
					"p-button-vertical": (props.iconPos === "top" || props.iconPos === "bottom") && props.label,
					"p-button-loading": props.loading,
					"p-button-link": props.link || props.variant === "link"
				}, "p-button-".concat(props.severity), props.severity), "p-button-raised", props.raised), "p-button-rounded", props.rounded), "p-button-text", props.text || props.variant === "text"), "p-button-outlined", props.outlined || props.variant === "outlined"), "p-button-sm", props.size === "small"), "p-button-lg", props.size === "large"), "p-button-plain", props.plain), "p-button-fluid", instance.hasFluid)];
			},
			loadingIcon: "p-button-loading-icon",
			icon: function icon(_ref3) {
				var props = _ref3.props;
				return ["p-button-icon", _defineProperty$2({}, "p-button-icon-".concat(props.iconPos), props.label)];
			},
			label: "p-button-label"
		}
	});
	var script$1 = {
		name: "BaseButton",
		"extends": script$5,
		props: {
			label: {
				type: String,
				"default": null
			},
			icon: {
				type: String,
				"default": null
			},
			iconPos: {
				type: String,
				"default": "left"
			},
			iconClass: {
				type: [String, Object],
				"default": null
			},
			badge: {
				type: String,
				"default": null
			},
			badgeClass: {
				type: [String, Object],
				"default": null
			},
			badgeSeverity: {
				type: String,
				"default": "secondary"
			},
			loading: {
				type: Boolean,
				"default": false
			},
			loadingIcon: {
				type: String,
				"default": void 0
			},
			as: {
				type: [String, Object],
				"default": "BUTTON"
			},
			asChild: {
				type: Boolean,
				"default": false
			},
			link: {
				type: Boolean,
				"default": false
			},
			severity: {
				type: String,
				"default": null
			},
			raised: {
				type: Boolean,
				"default": false
			},
			rounded: {
				type: Boolean,
				"default": false
			},
			text: {
				type: Boolean,
				"default": false
			},
			outlined: {
				type: Boolean,
				"default": false
			},
			size: {
				type: String,
				"default": null
			},
			variant: {
				type: String,
				"default": null
			},
			plain: {
				type: Boolean,
				"default": false
			},
			fluid: {
				type: Boolean,
				"default": null
			}
		},
		style: ButtonStyle,
		provide: function provide() {
			return {
				$pcButton: this,
				$parentInstance: this
			};
		}
	};
	function _typeof$1(o) {
		"@babel/helpers - typeof";
		return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof$1(o);
	}
	function _defineProperty$1(e, r, t) {
		return (r = _toPropertyKey$1(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey$1(t) {
		var i = _toPrimitive$1(t, "string");
		return "symbol" == _typeof$1(i) ? i : i + "";
	}
	function _toPrimitive$1(t, r) {
		if ("object" != _typeof$1(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof$1(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var script = {
		name: "Button",
		"extends": script$1,
		inheritAttrs: false,
		inject: { $pcFluid: { "default": null } },
		methods: { getPTOptions: function getPTOptions(key) {
			return (key === "root" ? this.ptmi : this.ptm)(key, { context: { disabled: this.disabled } });
		} },
		computed: {
			disabled: function disabled() {
				return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
			},
			defaultAriaLabel: function defaultAriaLabel() {
				return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
			},
			hasIcon: function hasIcon() {
				return this.icon || this.$slots.icon;
			},
			attrs: function attrs() {
				return (0, vue.mergeProps)(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
			},
			asAttrs: function asAttrs() {
				return this.as === "BUTTON" ? {
					type: "button",
					disabled: this.disabled
				} : void 0;
			},
			a11yAttrs: function a11yAttrs() {
				return {
					"aria-label": this.defaultAriaLabel,
					"data-pc-name": "button",
					"data-p-disabled": this.disabled,
					"data-p-severity": this.severity
				};
			},
			hasFluid: function hasFluid() {
				return isEmpty(this.fluid) ? !!this.$pcFluid : this.fluid;
			},
			dataP: function dataP() {
				return cn(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
			},
			dataIconP: function dataIconP() {
				return cn(_defineProperty$1(_defineProperty$1({}, this.iconPos, this.iconPos), this.size, this.size));
			},
			dataLabelP: function dataLabelP() {
				return cn(_defineProperty$1(_defineProperty$1({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
			}
		},
		components: {
			SpinnerIcon: script$3,
			Badge: script$2
		},
		directives: { ripple: Ripple }
	};
	var _hoisted_1 = ["data-p"];
	var _hoisted_2 = ["data-p"];
	function render(_ctx, _cache, $props, $setup, $data, $options) {
		var _component_SpinnerIcon = (0, vue.resolveComponent)("SpinnerIcon");
		var _component_Badge = (0, vue.resolveComponent)("Badge");
		var _directive_ripple = (0, vue.resolveDirective)("ripple");
		return !_ctx.asChild ? (0, vue.withDirectives)(((0, vue.openBlock)(), (0, vue.createBlock)((0, vue.resolveDynamicComponent)(_ctx.as), (0, vue.mergeProps)({
			key: 0,
			"class": _ctx.cx("root"),
			"data-p": $options.dataP
		}, $options.attrs), {
			"default": (0, vue.withCtx)(function() {
				return [(0, vue.renderSlot)(_ctx.$slots, "default", {}, function() {
					return [
						_ctx.loading ? (0, vue.renderSlot)(_ctx.$slots, "loadingicon", (0, vue.mergeProps)({
							key: 0,
							"class": [_ctx.cx("loadingIcon"), _ctx.cx("icon")]
						}, _ctx.ptm("loadingIcon")), function() {
							return [_ctx.loadingIcon ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", (0, vue.mergeProps)({
								key: 0,
								"class": [
									_ctx.cx("loadingIcon"),
									_ctx.cx("icon"),
									_ctx.loadingIcon
								]
							}, _ctx.ptm("loadingIcon")), null, 16)) : ((0, vue.openBlock)(), (0, vue.createBlock)(_component_SpinnerIcon, (0, vue.mergeProps)({
								key: 1,
								"class": [_ctx.cx("loadingIcon"), _ctx.cx("icon")],
								spin: ""
							}, _ctx.ptm("loadingIcon")), null, 16, ["class"]))];
						}) : (0, vue.renderSlot)(_ctx.$slots, "icon", (0, vue.mergeProps)({
							key: 1,
							"class": [_ctx.cx("icon")]
						}, _ctx.ptm("icon")), function() {
							return [_ctx.icon ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", (0, vue.mergeProps)({
								key: 0,
								"class": [
									_ctx.cx("icon"),
									_ctx.icon,
									_ctx.iconClass
								],
								"data-p": $options.dataIconP
							}, _ctx.ptm("icon")), null, 16, _hoisted_1)) : (0, vue.createCommentVNode)("", true)];
						}),
						_ctx.label ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", (0, vue.mergeProps)({
							key: 2,
							"class": _ctx.cx("label")
						}, _ctx.ptm("label"), { "data-p": $options.dataLabelP }), (0, vue.toDisplayString)(_ctx.label), 17, _hoisted_2)) : (0, vue.createCommentVNode)("", true),
						_ctx.badge ? ((0, vue.openBlock)(), (0, vue.createBlock)(_component_Badge, {
							key: 3,
							value: _ctx.badge,
							"class": (0, vue.normalizeClass)(_ctx.badgeClass),
							severity: _ctx.badgeSeverity,
							unstyled: _ctx.unstyled,
							pt: _ctx.ptm("pcBadge")
						}, null, 8, [
							"value",
							"class",
							"severity",
							"unstyled",
							"pt"
						])) : (0, vue.createCommentVNode)("", true)
					];
				})];
			}),
			_: 3
		}, 16, ["class", "data-p"])), [[_directive_ripple]]) : (0, vue.renderSlot)(_ctx.$slots, "default", {
			key: 1,
			"class": (0, vue.normalizeClass)(_ctx.cx("root")),
			a11yAttrs: $options.a11yAttrs
		});
	}
	script.render = render;
	var FilterMatchMode = {
		STARTS_WITH: "startsWith",
		CONTAINS: "contains",
		NOT_CONTAINS: "notContains",
		ENDS_WITH: "endsWith",
		EQUALS: "equals",
		NOT_EQUALS: "notEquals",
		IN: "in",
		LESS_THAN: "lt",
		LESS_THAN_OR_EQUAL_TO: "lte",
		GREATER_THAN: "gt",
		GREATER_THAN_OR_EQUAL_TO: "gte",
		BETWEEN: "between",
		DATE_IS: "dateIs",
		DATE_IS_NOT: "dateIsNot",
		DATE_BEFORE: "dateBefore",
		DATE_AFTER: "dateAfter"
	};
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), true).forEach(function(r) {
				_defineProperty(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function _defineProperty(e, r, t) {
		return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: true,
			configurable: true,
			writable: true
		}) : e[r] = t, e;
	}
	function _toPropertyKey(t) {
		var i = _toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	function _toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r);
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	var defaultOptions = {
		ripple: false,
		inputStyle: null,
		inputVariant: null,
		locale: {
			startsWith: "Starts with",
			contains: "Contains",
			notContains: "Not contains",
			endsWith: "Ends with",
			equals: "Equals",
			notEquals: "Not equals",
			noFilter: "No Filter",
			lt: "Less than",
			lte: "Less than or equal to",
			gt: "Greater than",
			gte: "Greater than or equal to",
			dateIs: "Date is",
			dateIsNot: "Date is not",
			dateBefore: "Date is before",
			dateAfter: "Date is after",
			clear: "Clear",
			apply: "Apply",
			matchAll: "Match All",
			matchAny: "Match Any",
			addRule: "Add Rule",
			removeRule: "Remove Rule",
			accept: "Yes",
			reject: "No",
			choose: "Choose",
			upload: "Upload",
			cancel: "Cancel",
			completed: "Completed",
			pending: "Pending",
			fileSizeTypes: [
				"B",
				"KB",
				"MB",
				"GB",
				"TB",
				"PB",
				"EB",
				"ZB",
				"YB"
			],
			dayNames: [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			dayNamesShort: [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			],
			dayNamesMin: [
				"Su",
				"Mo",
				"Tu",
				"We",
				"Th",
				"Fr",
				"Sa"
			],
			monthNames: [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			monthNamesShort: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			],
			chooseYear: "Choose Year",
			chooseMonth: "Choose Month",
			chooseDate: "Choose Date",
			prevDecade: "Previous Decade",
			nextDecade: "Next Decade",
			prevYear: "Previous Year",
			nextYear: "Next Year",
			prevMonth: "Previous Month",
			nextMonth: "Next Month",
			prevHour: "Previous Hour",
			nextHour: "Next Hour",
			prevMinute: "Previous Minute",
			nextMinute: "Next Minute",
			prevSecond: "Previous Second",
			nextSecond: "Next Second",
			am: "am",
			pm: "pm",
			today: "Today",
			weekHeader: "Wk",
			firstDayOfWeek: 0,
			showMonthAfterYear: false,
			dateFormat: "mm/dd/yy",
			weak: "Weak",
			medium: "Medium",
			strong: "Strong",
			passwordPrompt: "Enter a password",
			emptyFilterMessage: "No results found",
			searchMessage: "{0} results are available",
			selectionMessage: "{0} items selected",
			emptySelectionMessage: "No selected item",
			emptySearchMessage: "No results found",
			fileChosenMessage: "{0} files",
			noFileChosenMessage: "No file chosen",
			emptyMessage: "No available options",
			aria: {
				trueLabel: "True",
				falseLabel: "False",
				nullLabel: "Not Selected",
				star: "1 star",
				stars: "{star} stars",
				selectAll: "All items selected",
				unselectAll: "All items unselected",
				close: "Close",
				previous: "Previous",
				next: "Next",
				navigation: "Navigation",
				scrollTop: "Scroll Top",
				moveTop: "Move Top",
				moveUp: "Move Up",
				moveDown: "Move Down",
				moveBottom: "Move Bottom",
				moveToTarget: "Move to Target",
				moveToSource: "Move to Source",
				moveAllToTarget: "Move All to Target",
				moveAllToSource: "Move All to Source",
				pageLabel: "Page {page}",
				firstPageLabel: "First Page",
				lastPageLabel: "Last Page",
				nextPageLabel: "Next Page",
				prevPageLabel: "Previous Page",
				rowsPerPageLabel: "Rows per page",
				jumpToPageDropdownLabel: "Jump to Page Dropdown",
				jumpToPageInputLabel: "Jump to Page Input",
				selectRow: "Row Selected",
				unselectRow: "Row Unselected",
				expandRow: "Row Expanded",
				collapseRow: "Row Collapsed",
				showFilterMenu: "Show Filter Menu",
				hideFilterMenu: "Hide Filter Menu",
				filterOperator: "Filter Operator",
				filterConstraint: "Filter Constraint",
				editRow: "Row Edit",
				saveEdit: "Save Edit",
				cancelEdit: "Cancel Edit",
				listView: "List View",
				gridView: "Grid View",
				slide: "Slide",
				slideNumber: "{slideNumber}",
				zoomImage: "Zoom Image",
				zoomIn: "Zoom In",
				zoomOut: "Zoom Out",
				rotateRight: "Rotate Right",
				rotateLeft: "Rotate Left",
				listLabel: "Option List"
			}
		},
		filterMatchModeOptions: {
			text: [
				FilterMatchMode.STARTS_WITH,
				FilterMatchMode.CONTAINS,
				FilterMatchMode.NOT_CONTAINS,
				FilterMatchMode.ENDS_WITH,
				FilterMatchMode.EQUALS,
				FilterMatchMode.NOT_EQUALS
			],
			numeric: [
				FilterMatchMode.EQUALS,
				FilterMatchMode.NOT_EQUALS,
				FilterMatchMode.LESS_THAN,
				FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
				FilterMatchMode.GREATER_THAN,
				FilterMatchMode.GREATER_THAN_OR_EQUAL_TO
			],
			date: [
				FilterMatchMode.DATE_IS,
				FilterMatchMode.DATE_IS_NOT,
				FilterMatchMode.DATE_BEFORE,
				FilterMatchMode.DATE_AFTER
			]
		},
		zIndex: {
			modal: 1100,
			overlay: 1e3,
			menu: 1e3,
			tooltip: 1100
		},
		theme: void 0,
		unstyled: false,
		pt: void 0,
		ptOptions: {
			mergeSections: true,
			mergeProps: false
		},
		csp: { nonce: void 0 }
	};
	var PrimeVueSymbol = Symbol();
	function setup(app, options) {
		var PrimeVue = { config: (0, vue.reactive)(options) };
		app.config.globalProperties.$primevue = PrimeVue;
		app.provide(PrimeVueSymbol, PrimeVue);
		clearConfig();
		setupConfig(app, PrimeVue);
		return PrimeVue;
	}
	var stopWatchers = [];
	function clearConfig() {
		ThemeService.clear();
		stopWatchers.forEach(function(fn) {
			return fn === null || fn === void 0 ? void 0 : fn();
		});
		stopWatchers = [];
	}
	function setupConfig(app, PrimeVue) {
		var isThemeChanged = (0, vue.ref)(false);
		var loadCommonTheme = function loadCommonTheme() {
			var _PrimeVue$config;
			if (((_PrimeVue$config = PrimeVue.config) === null || _PrimeVue$config === void 0 ? void 0 : _PrimeVue$config.theme) === "none") return;
			if (!config_default.isStyleNameLoaded("common")) {
				var _BaseStyle$getCommonT, _PrimeVue$config2;
				var _ref = ((_BaseStyle$getCommonT = BaseStyle.getCommonTheme) === null || _BaseStyle$getCommonT === void 0 ? void 0 : _BaseStyle$getCommonT.call(BaseStyle)) || {}, primitive = _ref.primitive, semantic = _ref.semantic, global = _ref.global, style = _ref.style;
				var styleOptions = { nonce: (_PrimeVue$config2 = PrimeVue.config) === null || _PrimeVue$config2 === void 0 || (_PrimeVue$config2 = _PrimeVue$config2.csp) === null || _PrimeVue$config2 === void 0 ? void 0 : _PrimeVue$config2.nonce };
				BaseStyle.load(primitive === null || primitive === void 0 ? void 0 : primitive.css, _objectSpread({ name: "primitive-variables" }, styleOptions));
				BaseStyle.load(semantic === null || semantic === void 0 ? void 0 : semantic.css, _objectSpread({ name: "semantic-variables" }, styleOptions));
				BaseStyle.load(global === null || global === void 0 ? void 0 : global.css, _objectSpread({ name: "global-variables" }, styleOptions));
				BaseStyle.loadStyle(_objectSpread({ name: "global-style" }, styleOptions), style);
				config_default.setLoadedStyleName("common");
			}
		};
		ThemeService.on("theme:change", function(newTheme) {
			if (!isThemeChanged.value) {
				app.config.globalProperties.$primevue.config.theme = newTheme;
				isThemeChanged.value = true;
			}
		});
		var stopConfigWatcher = (0, vue.watch)(PrimeVue.config, function(newValue, oldValue) {
			PrimeVueService.emit("config:change", {
				newValue,
				oldValue
			});
		}, {
			immediate: true,
			deep: true
		});
		var stopRippleWatcher = (0, vue.watch)(function() {
			return PrimeVue.config.ripple;
		}, function(newValue, oldValue) {
			PrimeVueService.emit("config:ripple:change", {
				newValue,
				oldValue
			});
		}, {
			immediate: true,
			deep: true
		});
		var stopThemeWatcher = (0, vue.watch)(function() {
			return PrimeVue.config.theme;
		}, function(newValue, oldValue) {
			if (!isThemeChanged.value) config_default.setTheme(newValue);
			if (!PrimeVue.config.unstyled) loadCommonTheme();
			isThemeChanged.value = false;
			PrimeVueService.emit("config:theme:change", {
				newValue,
				oldValue
			});
		}, {
			immediate: true,
			deep: false
		});
		var stopUnstyledWatcher = (0, vue.watch)(function() {
			return PrimeVue.config.unstyled;
		}, function(newValue, oldValue) {
			if (!newValue && PrimeVue.config.theme) loadCommonTheme();
			PrimeVueService.emit("config:unstyled:change", {
				newValue,
				oldValue
			});
		}, {
			immediate: true,
			deep: true
		});
		stopWatchers.push(stopConfigWatcher);
		stopWatchers.push(stopRippleWatcher);
		stopWatchers.push(stopThemeWatcher);
		stopWatchers.push(stopUnstyledWatcher);
	}
	var PrimeVue = { install: function install(app, options) {
		setup(app, mergeKeys(defaultOptions, options));
	} };
	var fleet_toolbar_default = ":host {\n    all: initial !important;\n    display: block !important;\n    margin-block-start: 8px !important;\n}\n\n.toolbar {\n    font: 14px/1.45 system-ui, sans-serif;\n    color: #e7f1f6;\n    direction: ltr;\n    text-align: start;\n    color-scheme: dark;\n}\n\n.actions,\n.options {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: start;\n    gap: 6px;\n}\n\n.options {\n    margin-block-start: 6px;\n}\n\n[hidden] {\n    display: none !important;\n}\n\n.action {\n    box-sizing: border-box;\n    border: 1px solid #547488;\n    border-radius: 4px;\n    background: #172b37;\n    color: #e7f1f6;\n    padding: 5px 10px;\n    font: inherit;\n    cursor: pointer;\n}\n\n.action:hover,\n.action[aria-expanded='true'] {\n    background: #244657;\n}\n\n.action:focus-visible,\n.fallback:focus-visible {\n    outline: 2px solid #91daff;\n    outline-offset: 2px;\n}\n\n.status:not(:empty) {\n    margin-block-start: 6px;\n    overflow-wrap: anywhere;\n}\n\n.fallback {\n    box-sizing: border-box;\n    display: block;\n    width: 100%;\n    margin-block-start: 6px;\n    border: 1px solid #547488;\n    border-radius: 4px;\n    background: #101e27;\n    color: #e7f1f6;\n    padding: 6px;\n    font: 13px/1.4 ui-monospace, monospace;\n}\n";
	var panelId$1 = "astro-empires-fleet-actions";
	var languages = [["chinese", "chinese"], ["english", "english"]];
	function mountFleetActions(table, sources, calculators, readTechnologies) {
		const availableSources = sources.filter(({ units }) => units.length);
		if (!availableSources.length) return;
		const host = document.createElement("div");
		host.id = panelId$1;
		const shadow = host.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = fleet_toolbar_default;
		const container = document.createElement("div");
		container.className = "toolbar";
		shadow.append(style, container);
		table.after(host);
		setPrimeVueStyleRoot(shadow);
		(0, vue.createApp)({ setup() {
			const expanded = (0, vue.ref)(null);
			const status = (0, vue.ref)(null);
			const fallback = (0, vue.ref)(null);
			const textarea = (0, vue.ref)(null);
			const copyChoices = availableSources.flatMap(({ units, side }) => languages.map(([language, languageLabel]) => {
				const label = side ? msg("copyChoice", {
					side: msg(side),
					language: msg(languageLabel)
				}) : msg(languageLabel);
				return [label, () => copyFleet(units, language, label)];
			}));
			const calculatorChoices = calculators.map(([label, rosters]) => [msg(label), () => openCalculator(rosters)]);
			function actionButton(label, onClick, attrs = {}) {
				return (0, vue.h)(script, {
					label: t(label),
					type: "button",
					class: "action",
					onClick,
					...attrs
				});
			}
			function menu(id, label, choices) {
				const triggerId = `${panelId$1}-${id}-trigger`;
				const optionsId = `${panelId$1}-${id}-options`;
				const open = expanded.value === id;
				return (0, vue.h)("div", [actionButton(label, () => {
					expanded.value = open ? null : id;
				}, {
					id: triggerId,
					"aria-controls": optionsId,
					"aria-expanded": String(open)
				}), (0, vue.h)("div", {
					id: optionsId,
					class: "options",
					hidden: !open
				}, choices.map(([choice, action]) => actionButton(choice, () => {
					expanded.value = null;
					shadow.getElementById(triggerId)?.focus();
					action();
				}, { key: t(choice) })))]);
			}
			async function copyFleet(units, language, label) {
				const text = formatFleetTsv(units, language);
				fallback.value = null;
				try {
					await navigator.clipboard.writeText(text);
					status.value = msg("copiedFleet", { choice: label });
				} catch {
					status.value = msg("clipboardFleet");
					fallback.value = {
						text,
						rows: Math.min(units.length, 6)
					};
					await (0, vue.nextTick)();
					textarea.value?.focus();
					textarea.value?.select();
				}
			}
			function openCalculator(rosters) {
				expanded.value = null;
				const combat = readTechnologies?.();
				const result = buildCalculatorUrl(rosters, combat?.technologies, language.value);
				if ("unknownNames" in result) {
					status.value = msg("unknownImport", { names: result.unknownNames });
					return;
				}
				if (combat) status.value = combat.notice;
				window.open(result.url.href, "_blank", "noopener,noreferrer");
			}
			return () => [
				(0, vue.h)("div", { class: "actions" }, [menu("copy", "copyFleet", copyChoices), calculatorChoices.length === 1 ? actionButton(...calculatorChoices[0]) : menu("aebits", "calculator", calculatorChoices)]),
				(0, vue.h)("div", {
					class: "status",
					role: "status"
				}, t(status.value)),
				(0, vue.h)("textarea", {
					ref: textarea,
					class: "fallback",
					readonly: true,
					hidden: !fallback.value,
					rows: fallback.value?.rows ?? 1,
					value: fallback.value?.text ?? "",
					"aria-label": t("fleetData")
				})
			];
		} }).use(PrimeVue, {
			unstyled: true,
			ripple: false
		}).mount(container);
	}
	function analyzeReport(text) {
		const createSide = () => ({
			observations: [],
			modifiers: {
				CC: null,
				TaC: null,
				DfC: null,
				fullDefenses: false
			},
			hasInformation: false,
			warnings: [],
			units: [],
			importErrors: []
		});
		const sides = {
			attacker: createSide(),
			defender: createSide()
		};
		let side;
		let inUnits = false;
		const parsed = readBbcodeRows(text);
		for (const { cells, inCode } of parsed.rows) {
			if (!inCode) inUnits = false;
			const label = cells[0].toLowerCase();
			if (/^(?:攻击舰队|attack force)$/.test(label) || /^(?:防御舰队|defensive force)$/.test(label)) {
				side = /^(?:攻击舰队|attack force)$/.test(label) ? "attacker" : "defender";
				inUnits = false;
				continue;
			}
			if (!side) continue;
			const report = sides[side];
			if (inCode && /^(?:舰船|ships?|units?)$/.test(label)) {
				inUnits = true;
				continue;
			}
			if (inUnits) {
				const quantity = readNumber(cells[1]);
				if (cells.length !== 6 || quantity === void 0 || quantity <= 0) {
					const warning = msg(cells.length !== 6 ? "incompleteRow" : "invalidQuantity", { name: cells[0] || msg("unnamedUnit") });
					report.warnings.push(warning);
					report.importErrors.push(warning);
					continue;
				}
				const unit = {
					...identifyFleetUnit(cells[0]),
					quantity
				};
				const { code } = unit;
				report.units.push(unit);
				if (!code) {
					const warning = msg("unknownUnit", { name: cells[0] });
					report.warnings.push(warning);
					report.importErrors.push(warning);
				}
				const observation = {
					code,
					attack: readNumber(cells[3]),
					armour: readNumber(cells[4]),
					shield: readNumber(cells[5])
				};
				if ([
					observation.attack,
					observation.armour,
					observation.shield
				].some((value) => value === void 0)) report.warnings.push(msg("incompleteStats", { name: cells[0] }));
				report.observations.push(observation);
				continue;
			}
			if (!/^(?:玩家|player|舰队名称|fleet name|基地|base|初始防御|start defenses|战后防御|end defenses|指挥中心|command centers|指挥官|commander)$/.test(label)) continue;
			if (!report.hasInformation) {
				Object.assign(report.modifiers, {
					CC: 0,
					TaC: 0,
					DfC: 0
				});
				report.hasInformation = true;
			}
			const value = cells[1] ?? "";
			switch (label) {
				case "指挥中心":
				case "command centers":
					report.modifiers.CC = readLevel(value);
					break;
				case "指挥官":
				case "commander":
					Object.assign(report.modifiers, readCommander(value));
					break;
				case "初始防御":
				case "start defenses": report.modifiers.fullDefenses = readNumber(value.replace(/[%％]$/, "")) === 100;
			}
		}
		const result = (side) => ({
			...inferCombatTechnology(side.observations, side.modifiers),
			count: side.observations.filter((observation) => observation.code).length,
			warnings: uniqueMessages(side.warnings),
			units: side.units,
			importErrors: uniqueMessages(side.importErrors)
		});
		return {
			attacker: result(sides.attacker),
			defender: result(sides.defender),
			error: parsed.error
		};
	}
	function buildReportCalculatorUrl(report, locale = "zh-CN") {
		if (report.error) return { error: report.error };
		const errors = [...report.attacker.importErrors.map((error) => msg("sideIssue", {
			side: msg("attacker"),
			issue: error
		})), ...report.defender.importErrors.map((error) => msg("sideIssue", {
			side: msg("defender"),
			issue: error
		}))];
		if (errors.length) return { error: msg("importBlocked", { issues: errors }) };
		if (!report.attacker.units.length && !report.defender.units.length) return { error: msg("noImportUnits") };
		const result = buildCalculatorUrl({
			aS: report.attacker.units,
			dS: report.defender.units
		}, {
			aT: report.attacker.units.length ? report.attacker.levels : {},
			dT: report.defender.units.length ? report.defender.levels : {}
		}, locale);
		return "unknownNames" in result ? { error: msg("unknownImport", { names: result.unknownNames }) } : result;
	}
	function readBbcodeRows(text) {
		const rows = [];
		let inCode = false;
		let error = null;
		for (const part of text.split(/(\[\/?code\])/i)) if (/^\[code\]$/i.test(part)) {
			if (inCode) error = msg("codeNested");
			inCode = true;
		} else if (/^\[\/code\]$/i.test(part)) {
			if (!inCode) error = msg("codeMissingStart");
			inCode = false;
		} else for (const sourceLine of part.split(/\r?\n/)) {
			const line = cleanCell(sourceLine);
			if (!line) continue;
			const cells = inCode ? sourceLine.trim().split(sourceLine.includes("	") ? "	" : / {2,}/).map(cleanCell) : line.split(/[:：](.*)/s).slice(0, 2).map((value) => value.trim());
			rows.push({
				cells,
				inCode
			});
		}
		if (inCode) error = msg("codeMissingEnd");
		return {
			rows,
			error
		};
	}
	function cleanCell(text) {
		return text.replace(/\[\/?(?:b|i|u|s|color|size|url|center|left|right)(?:=[^\]\r\n]*)?\]/gi, "").replace(/&(?:nbsp|#x20|#32|#160);/gi, " ").replace(/&#91;/g, "[").replace(/&#93;/g, "]").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
	}
	function uniqueMessages(messages) {
		return [...new Map(messages.map((message) => [JSON.stringify(message), message])).values()];
	}
	var report_analyzer_default = ":host {\n    all: initial !important;\n    position: fixed !important;\n    inset: auto 16px 16px auto !important;\n    z-index: 2147483647 !important;\n    display: block !important;\n    width: 48px !important;\n    height: 48px !important;\n    color-scheme: dark;\n}\n\n* {\n    box-sizing: border-box;\n}\n\ndiv {\n    font: 14px/1.5 system-ui, sans-serif;\n    color: #e7f1f6;\n    direction: ltr;\n    text-align: start;\n}\n\n[hidden] {\n    display: none !important;\n}\n\nbutton,\ntextarea,\nselect {\n    font: inherit;\n    color: #e7f1f6;\n    border: 1px solid #547488;\n    border-radius: 4px;\n    background: #172b37;\n    padding: 6px 12px;\n}\n\nbutton {\n    cursor: pointer;\n}\n\nbutton:hover {\n    background: #244657;\n}\n\nbutton:focus-visible,\ntextarea:focus-visible {\n    outline: 2px solid #91daff;\n    outline-offset: 2px;\n}\n\nselect:focus-visible {\n    outline: 2px solid #91daff;\n    outline-offset: 2px;\n}\n\n.settings-dialog,\n.help-dialog {\n    font: 14px/1.5 system-ui, sans-serif;\n    color: #e7f1f6;\n    color-scheme: dark;\n    background: #101e27;\n    border: 1px solid #547488;\n    border-radius: 8px;\n    padding: 20px;\n    width: min(420px, calc(100vw - 32px));\n    max-height: calc(100dvh - 32px);\n    margin: auto;\n    overflow: auto;\n}\n\n.settings-dialog::backdrop,\n.help-dialog::backdrop {\n    background: #0009;\n}\n\n.help-dialog {\n    width: min(640px, calc(100vw - 32px));\n    overflow-wrap: anywhere;\n}\n\n.help-dialog section {\n    margin: 20px 0;\n}\n\n.help-dialog h3 {\n    color: #91daff;\n    font-size: 16px;\n}\n\n.settings-dialog fieldset {\n    border: 1px solid #547488;\n    margin: 12px 0;\n    padding: 12px;\n}\n\n.settings-dialog label {\n    display: block;\n    margin-bottom: 6px;\n}\n\n.settings-dialog select {\n    width: 100%;\n}\n\n.settings-actions {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: flex-end;\n    gap: 8px;\n}\n\n.trigger {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    font-size: 20px;\n}\n\n.material-icons {\n    font-family: 'Astro Empires Material Icons';\n    font-size: 24px;\n    font-weight: 400;\n    font-style: normal;\n    line-height: 1;\n    letter-spacing: normal;\n    text-transform: none;\n    white-space: nowrap;\n    direction: ltr;\n    font-feature-settings: 'liga';\n}\n\n.feature-list {\n    position: absolute;\n    bottom: 60px;\n    right: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    width: max-content;\n    max-width: calc(100vw - 32px);\n}\n\n.panel {\n    position: absolute;\n    bottom: 60px;\n    right: 0;\n    width: min(440px, calc(100vw - 32px));\n    max-height: calc(100dvh - 92px);\n    overflow: auto;\n    border: 1px solid #547488;\n    border-radius: 8px;\n    padding: 16px;\n    background: #101e27;\n    box-shadow: 0 6px 24px #0008;\n    overflow-wrap: anywhere;\n}\n\nheader {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 8px;\n    margin-bottom: 12px;\n}\n\nh2,\nh3,\nh4,\np {\n    margin: 0 0 8px;\n}\n\nh2 {\n    font-size: 18px;\n}\n\nh3,\nh4 {\n    font-size: 14px;\n}\n\ntextarea {\n    display: block;\n    width: 100%;\n    resize: vertical;\n    min-height: 80px;\n    margin: 4px 0 8px;\n    background: #07131c;\n}\n\n.results,\n.side {\n    margin-top: 16px;\n}\n\ndl {\n    display: grid;\n    grid-template-columns: 1fr max-content;\n    gap: 4px 12px;\n    margin: 0 0 12px;\n}\n\ndd {\n    margin: 0;\n    font-variant-numeric: tabular-nums;\n}\n\nul {\n    margin: 0 0 8px;\n    padding-left: 20px;\n}\n\n.note {\n    color: #afc5d2;\n}\n";
	var settingsKey = "astro-empires-settings";
	var needsLanguageChoice = (0, vue.ref)(false);
	function readSettings(storage) {
		try {
			const value = JSON.parse(storage.getItem("astro-empires-settings") ?? "null");
			if (value && typeof value === "object" && "language" in value && (value.language === "zh-CN" || value.language === "en")) return { language: value.language };
		} catch {}
		return null;
	}
	function initializeSettings() {
		let settings = null;
		try {
			settings = readSettings(localStorage);
		} catch {}
		language.value = settings?.language ?? "en";
		needsLanguageChoice.value = settings === null;
	}
	function saveLanguage(locale) {
		language.value = locale;
		needsLanguageChoice.value = false;
		try {
			localStorage.setItem(settingsKey, JSON.stringify({ language: locale }));
			return true;
		} catch {
			return false;
		}
	}
	var SettingsDialog = (0, vue.defineComponent)({
		emits: ["closed"],
		setup(_, { expose, emit }) {
			const dialog = (0, vue.ref)(null);
			const draft = (0, vue.ref)("en");
			const firstChoice = (0, vue.ref)(false);
			const status = (0, vue.ref)(null);
			let shown = false;
			async function open(initial = false) {
				firstChoice.value = initial;
				draft.value = language.value;
				status.value = null;
				await (0, vue.nextTick)();
				if (!dialog.value?.open) {
					shown = true;
					dialog.value?.showModal();
				}
			}
			function finish() {
				if (!shown || dialog.value?.open) return;
				shown = false;
				needsLanguageChoice.value = false;
				emit("closed");
			}
			function close() {
				dialog.value?.close();
				finish();
			}
			function save() {
				if (saveLanguage(draft.value)) close();
				else status.value = msg("saveFailed");
			}
			expose({ open });
			(0, vue.onMounted)(() => {
				if (needsLanguageChoice.value) open(true);
			});
			return () => (0, vue.h)("dialog", {
				ref: dialog,
				class: "settings-dialog",
				"aria-labelledby": "astro-empires-settings-title",
				lang: language.value,
				onClose: finish,
				onCancel: (event) => {
					event.preventDefault();
					close();
				}
			}, [
				(0, vue.h)("h2", { id: "astro-empires-settings-title" }, firstChoice.value ? "选择语言 / Choose language" : t("settings")),
				(0, vue.h)("fieldset", [
					(0, vue.h)("legend", firstChoice.value ? "显示 / Display" : t("display")),
					(0, vue.h)("label", { for: "astro-empires-settings-language" }, firstChoice.value ? "语言 / Language" : t("language")),
					(0, vue.h)("select", {
						id: "astro-empires-settings-language",
						value: draft.value,
						autofocus: true,
						onChange: (event) => {
							draft.value = event.target.value;
						}
					}, [(0, vue.h)("option", { value: "zh-CN" }, "简体中文"), (0, vue.h)("option", { value: "en" }, "English")])
				]),
				(0, vue.h)("p", {
					role: "status",
					hidden: !status.value
				}, t(status.value)),
				(0, vue.h)("div", { class: "settings-actions" }, [(0, vue.h)("button", {
					type: "button",
					onClick: save
				}, firstChoice.value ? "保存 / Save" : t("save")), (0, vue.h)("button", {
					type: "button",
					onClick: close
				}, firstChoice.value ? "稍后 / Later" : t("cancel"))])
			]);
		}
	});
	var sections = [
		{
			title: "copyReport",
			text: ["helpReportPages", "helpReportCopy"]
		},
		{
			title: "analyzeBbcode",
			text: ["helpAnalyzePaste", "helpAnalyzeResults"]
		},
		{
			title: "importCalculator",
			text: ["helpImport", "helpImportErrors"]
		},
		{
			title: "helpFleetCombat",
			text: ["helpFleet", "helpCombat"]
		},
		{
			title: "estimatedArrival",
			text: ["helpArrival", "helpClocks"]
		},
		{
			title: "settings",
			text: ["helpLanguageFirst", "helpLanguageSettings"]
		}
	];
	var HelpDialog = (0, vue.defineComponent)({
		emits: ["closed"],
		setup(_, { expose, emit }) {
			const dialog = (0, vue.ref)(null);
			const title = (0, vue.ref)(null);
			let shown = false;
			async function open() {
				await (0, vue.nextTick)();
				if (!dialog.value?.open) {
					shown = true;
					dialog.value?.showModal();
					title.value?.focus();
				}
			}
			function finish() {
				if (!shown || dialog.value?.open) return;
				shown = false;
				emit("closed");
			}
			function close() {
				dialog.value?.close();
				finish();
			}
			expose({ open });
			return () => (0, vue.h)("dialog", {
				ref: dialog,
				id: "astro-empires-help",
				class: "help-dialog",
				lang: language.value,
				"aria-labelledby": "astro-empires-help-title",
				onClose: finish,
				onCancel: (event) => {
					event.preventDefault();
					close();
				}
			}, [
				(0, vue.h)("h2", {
					ref: title,
					id: "astro-empires-help-title",
					tabindex: -1
				}, t("helpTitle")),
				(0, vue.h)("p", t("helpIntro")),
				...sections.map((section) => (0, vue.h)("section", [(0, vue.h)("h3", t(section.title)), ...section.text.map((key) => (0, vue.h)("p", t(key)))])),
				(0, vue.h)("div", { class: "settings-actions" }, [(0, vue.h)("button", {
					type: "button",
					onClick: close
				}, t("close"))])
			]);
		}
	});
	var panelId = "astro-empires-report-analyzer";
	var materialIconsUrl = "https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf";
	function mountReportAnalyzer() {
		if (document.getElementById(panelId)) return;
		const host = document.createElement("div");
		host.id = panelId;
		const root = host.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = report_analyzer_default;
		const container = document.createElement("div");
		root.append(style, container);
		document.body.append(host);
		(0, vue.createApp)({ setup() {
			const view = (0, vue.ref)(null);
			const iconsReady = (0, vue.ref)(false);
			const text = (0, vue.ref)("");
			const result = (0, vue.ref)(null);
			const message = (0, vue.ref)(null);
			const trigger = (0, vue.ref)(null);
			const analysisButton = (0, vue.ref)(null);
			const input = (0, vue.ref)(null);
			const settingsButton = (0, vue.ref)(null);
			const settingsDialog = (0, vue.ref)(null);
			const returningFromSettings = (0, vue.ref)(false);
			const helpButton = (0, vue.ref)(null);
			const helpDialog = (0, vue.ref)(null);
			new FontFace("Astro Empires Material Icons", `url("${materialIconsUrl}") format("truetype")`, {
				style: "normal",
				weight: "400"
			}).load().then((loaded) => {
				document.fonts.add(loaded);
				iconsReady.value = true;
			}).catch(() => {});
			async function show(next) {
				view.value = next;
				await (0, vue.nextTick)();
				if (next === "analysis") input.value?.focus();
				else if (next === "menu") analysisButton.value?.focus();
				else trigger.value?.focus();
			}
			function analyze() {
				result.value = null;
				message.value = null;
				if (!text.value.trim()) {
					message.value = msg("pasteFirst");
					return;
				}
				const report = analyzeReport(text.value);
				if (report.error) {
					message.value = report.error;
					return;
				}
				if (!report.attacker.count && !report.defender.count) {
					message.value = msg("noRecognized", { details: [...report.attacker.importErrors, ...report.defender.importErrors] });
					return;
				}
				result.value = report;
			}
			function openCalculator() {
				if (!result.value) return;
				const calculator = buildReportCalculatorUrl(result.value, language.value);
				if ("error" in calculator) {
					message.value = calculator.error;
					return;
				}
				message.value = null;
				window.open(calculator.url.href, "_blank", "noopener,noreferrer");
			}
			const label = (code) => `${t(fieldLabels[code])} (${code})`;
			function renderSide(title, side) {
				return (0, vue.h)("section", { class: "side" }, [
					(0, vue.h)("h3", title),
					!side.count ? (0, vue.h)("p", t("noUnits")) : [
						Object.keys(side.levels).length ? (0, vue.h)("dl", Object.entries(side.levels).flatMap(([code, level]) => [(0, vue.h)("dt", label(code)), (0, vue.h)("dd", String(level))])) : (0, vue.h)("p", t("noLevels")),
						side.unresolved.length ? (0, vue.h)("div", [(0, vue.h)("h4", t("pending")), (0, vue.h)("ul", side.unresolved.map((code) => (0, vue.h)("li", t(msg("fieldReason", {
							field: label(code),
							reason: side.reasons[code]
						})))))]) : null,
						(0, vue.h)("p", { class: "note" }, t("unlisted"))
					],
					side.warnings.length ? (0, vue.h)("ul", side.warnings.map((warning) => (0, vue.h)("li", t(warning)))) : null
				]);
			}
			return () => (0, vue.h)("div", {
				lang: language.value,
				onKeydown: (event) => {
					if (event.key === "Escape" && view.value) {
						event.preventDefault();
						show(view.value === "analysis" ? "menu" : null);
					}
				}
			}, [
				(0, vue.h)("div", {
					id: `${panelId}-menu`,
					class: "feature-list",
					hidden: view.value !== "menu",
					role: "group",
					"aria-label": t("menu")
				}, [
					(0, vue.h)("button", {
						ref: analysisButton,
						type: "button",
						onClick: () => show("analysis")
					}, t("analyzeBbcode")),
					(0, vue.h)("button", {
						ref: settingsButton,
						type: "button",
						onClick: () => {
							returningFromSettings.value = true;
							view.value = null;
							settingsDialog.value?.open();
						}
					}, t("settings")),
					(0, vue.h)("button", {
						ref: helpButton,
						type: "button",
						"aria-haspopup": "dialog",
						"aria-controls": "astro-empires-help",
						onClick: () => {
							view.value = null;
							helpDialog.value?.open();
						}
					}, t("help"))
				]),
				(0, vue.h)("section", {
					id: `${panelId}-panel`,
					class: "panel",
					hidden: view.value !== "analysis",
					role: "dialog",
					"aria-labelledby": `${panelId}-title`
				}, [
					(0, vue.h)("header", [(0, vue.h)("h2", { id: `${panelId}-title` }, t("analysisTitle")), (0, vue.h)("button", {
						type: "button",
						"aria-label": t("closeAnalysis"),
						onClick: () => show("menu")
					}, t("close"))]),
					(0, vue.h)("label", { for: `${panelId}-input` }, t("reportInput")),
					(0, vue.h)("textarea", {
						ref: input,
						id: `${panelId}-input`,
						rows: 8,
						spellcheck: false,
						value: text.value,
						placeholder: t("reportPlaceholder"),
						onInput: (event) => {
							text.value = event.target.value;
							result.value = null;
							message.value = null;
						}
					}),
					(0, vue.h)("button", {
						type: "button",
						onClick: analyze
					}, t("analyze")),
					(0, vue.h)("p", {
						role: "status",
						hidden: !message.value
					}, t(message.value)),
					result.value ? (0, vue.h)("div", { class: "results" }, [
						(0, vue.h)("button", {
							type: "button",
							onClick: openCalculator
						}, t("importCalculator")),
						renderSide(t("attacker"), result.value.attacker),
						renderSide(t("defender"), result.value.defender)
					]) : null
				]),
				(0, vue.h)("button", {
					ref: trigger,
					type: "button",
					class: "trigger",
					"aria-label": t(view.value ? "closeMenu" : "openMenu"),
					"aria-expanded": String(view.value !== null),
					"aria-controls": `${panelId}-menu ${panelId}-panel`,
					onClick: () => show(view.value ? null : "menu")
				}, [(0, vue.h)("span", {
					class: iconsReady.value ? "material-icons" : "icon-fallback",
					"aria-hidden": "true"
				}, iconsReady.value ? view.value ? "close" : "keyboard_arrow_up" : view.value ? "×" : "↑")]),
				(0, vue.h)(SettingsDialog, {
					ref: settingsDialog,
					onClosed: async () => {
						if (returningFromSettings.value) {
							returningFromSettings.value = false;
							await show("menu");
							settingsButton.value?.focus();
						} else trigger.value?.focus();
					}
				}),
				(0, vue.h)(HelpDialog, {
					ref: helpDialog,
					onClosed: async () => {
						await show("menu");
						helpButton.value?.focus();
					}
				})
			]);
		} }).mount(container);
	}
	var reportTables = new Set([
		"battle-report_info",
		"battle-report_attack",
		"battle-report_defense"
	]);
	function reportToBbcode(report, baseUrl) {
		for (const name of reportTables) if (!report.querySelector(`table.${name}`)) throw new Error("incompleteReport");
		function serialize(node) {
			if (node.nodeType === 3) return (node.textContent ?? "").replace(/\s+/g, " ");
			if (node.nodeType !== 1) return "";
			const element = node;
			if (element.matches("script,style")) return "";
			if (element.tagName === "BR") return "\n";
			if (element.tagName === "TABLE") return serializeTable(element);
			const contents = Array.from(element.childNodes, serialize).join("");
			if (element.matches("b,strong")) return `[b]${contents}[/b]`;
			if (element.tagName === "A") {
				const url = new URL(element.getAttribute("href") ?? "", baseUrl);
				if (url.protocol === "https:" || url.protocol === "http:") return `[url=${url.href.replaceAll("[", "%5B").replaceAll("]", "%5D")}]${contents}[/url]`;
			}
			return element.matches("center,div,p") ? `${contents.trim()}\n` : contents;
		}
		function serializeTable(table) {
			const name = [...table.classList].find((value) => reportTables.has(value));
			if (!name || table.closest(".battle-report") !== report) return "";
			const rows = Array.from(table.rows).filter((row) => row.closest("table") === table);
			if (name === "battle-report_info") return rows.map((row) => {
				const cells = Array.from(row.cells, (cell) => Array.from(cell.childNodes, serialize).join("").trim());
				return cells.length === 1 ? `[b]${cells[0]}[/b]` : `${cells[0]}：${cells.slice(1).join(" ")}`;
			}).join("\n") + "\n";
			let title = "";
			const lines = [];
			for (const row of rows) {
				const cells = Array.from(row.cells, (cell) => cell.textContent.replace(/\s+/g, " ").trim());
				if (cells.length === 1) title = `[b]${cells[0]}[/b]`;
				else lines.push(cells.join("	"));
			}
			return `${title}\n[code]\n${lines.join("\n")}\n[/code]\n`;
		}
		return Array.from(report.childNodes, serialize).join("").replace(/\n{3,}/g, "\n\n").trim();
	}
	var marker = "data-astro-empires-report-copy";
	function initializeReportCopy() {
		if (document.documentElement.hasAttribute(marker)) return;
		document.documentElement.setAttribute(marker, "");
		function attach(report) {
			if (report.nextElementSibling?.hasAttribute(marker)) return;
			const host = document.createElement("div");
			host.setAttribute(marker, "");
			const root = host.attachShadow({ mode: "open" });
			const style = document.createElement("style");
			style.textContent = fleet_toolbar_default;
			const container = document.createElement("div");
			container.className = "toolbar";
			root.append(style, container);
			report.after(host);
			(0, vue.createApp)({ setup() {
				const status = (0, vue.ref)(null);
				const fallback = (0, vue.ref)("");
				const textarea = (0, vue.ref)(null);
				let copying = false;
				async function copy() {
					if (copying) return;
					copying = true;
					fallback.value = "";
					try {
						const text = reportToBbcode(report, location.href);
						try {
							await navigator.clipboard.writeText(text);
							status.value = msg("copiedReport");
						} catch {
							status.value = msg("clipboardReport");
							fallback.value = text;
							await (0, vue.nextTick)();
							textarea.value?.focus();
							textarea.value?.select();
						}
					} catch {
						status.value = msg("incompleteReport");
					} finally {
						copying = false;
					}
				}
				return () => [
					(0, vue.h)("button", {
						type: "button",
						class: "action",
						onClick: copy
					}, t("copyReport")),
					(0, vue.h)("div", {
						class: "status",
						role: "status"
					}, t(status.value)),
					(0, vue.h)("textarea", {
						ref: textarea,
						class: "fallback",
						readonly: true,
						rows: 6,
						hidden: !fallback.value,
						value: fallback.value,
						"aria-label": t("reportInput")
					})
				];
			} }).mount(container);
		}
		function scan(element) {
			if (element.matches(".battle-report")) attach(element);
			element.querySelectorAll(".battle-report").forEach(attach);
		}
		scan(document.body);
		new MutationObserver((records) => {
			for (const record of records) for (const node of record.addedNodes) if (node instanceof Element) scan(node);
		}).observe(document.body, {
			childList: true,
			subtree: true
		});
	}
	function initializeFleetActions() {
		console.debug("[Astro Empires] 腳本已載入");
		if (location.hostname !== "borealis.astroempires.com" || document.getElementById("astro-empires-fleet-actions")) return;
		const params = new URLSearchParams(location.search);
		if (!/^[1-9]\d*$/.test(params.get("fleet") ?? "")) return;
		if (location.pathname === "/fleet.aspx") {
			if (params.get("view") === "move") {
				mountFleetArrival();
				return;
			}
			const table = document.querySelector("#fleet_overview table.listing");
			if (!table) return;
			const units = readUnitRows(table).map(({ unit }) => unit);
			mountFleetActions(table, [{ units }], [["attacker", { aS: units }], ["defender", { dS: units }]]);
			return;
		}
		const attack = params.get("attack");
		const validAttack = attack === "base" || attack === "fleet" || /^[1-9]\d*$/.test(attack ?? "");
		if (location.pathname !== "/combat.aspx" || !validAttack) return;
		const attackTable = document.querySelector("table.battle-report_attack");
		const defenseTable = document.querySelector("table.battle-report_defense");
		const lastTable = defenseTable ?? attackTable;
		if (!lastTable) return;
		const attackRows = readUnitRows(attackTable);
		const defenseRows = readUnitRows(defenseTable, true);
		const attacker = attackRows.map(({ unit }) => unit);
		const defender = defenseRows.map(({ unit }) => unit);
		mountFleetActions(lastTable, [{
			units: attacker,
			side: "attacker"
		}, {
			units: defender,
			side: "defender"
		}], [["calculator", {
			aS: attacker,
			dS: defender
		}]], () => readCombatTechnologies(document.querySelector("table.battle-report_info"), attackRows, defenseRows));
	}
	function readUnitRows(table, includeDefenses = false) {
		const unitRows = [];
		for (const row of table?.rows ?? []) {
			const [nameCell, quantityCell] = row.cells;
			if (nameCell?.tagName !== "TD" || quantityCell?.tagName !== "TD") continue;
			const unit = parseFleetUnit(nameCell.textContent, quantityCell.textContent, includeDefenses);
			if (unit) unitRows.push({
				unit,
				row
			});
		}
		return unitRows;
	}
	if (location.hostname === "borealis.astroempires.com") {
		initializeSettings();
		mountReportAnalyzer();
		initializeFleetActions();
		if ([
			"/messages.aspx",
			"/board.aspx",
			"/combat.aspx"
		].includes(location.pathname)) initializeReportCopy();
	}
})(Vue);

// Third-party licenses
// PrimeVue source: https://github.com/primefaces/primevue/tree/4.5.5
//
// PrimeVue is bundled so the userscript can redirect its style loader into the toolbar Shadow Root.
//
// # Licenses
//
// The app bundles dependencies which contain the following licenses:
//
// ## @primevue/core - 4.5.5 (MIT)
//
// The MIT License (MIT)
//
// Copyright (c) 2018-2025 PrimeTek
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// ## @primevue/icons - 4.5.5 (MIT)
//
// The MIT License (MIT)
//
// Copyright (c) 2018-2025 PrimeTek
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// ## primevue - 4.5.5 (MIT)
//
// The MIT License (MIT)
//
// Copyright (c) 2018-2025 PrimeTek
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// ## @primeuix/styled - 0.7.4 (MIT)
// https://github.com/primefaces/primeuix/tree/b9467bc448d35738d4f651dbc3caa4d4cb9a6a96/packages/styled
//
// MIT License
//
// Copyright (c) 2025 PrimeTek
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// ## @primeuix/styles - 2.0.3 (MIT)
// https://github.com/primefaces/primeuix/tree/b9467bc448d35738d4f651dbc3caa4d4cb9a6a96/packages/styles
//
// MIT License
//
// Copyright (c) 2025 PrimeTek
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// ## @primeuix/utils - 0.6.4 (MIT)
// https://github.com/primefaces/primeuix/tree/b9467bc448d35738d4f651dbc3caa4d4cb9a6a96/packages/utils
//
// MIT License
//
// Copyright (c) 2025 PrimeTek
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

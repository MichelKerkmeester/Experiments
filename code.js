"use strict";
// Main plugin code for Figma Sankey Chart Generator
// Show the plugin UI
figma.showUI(__html__, {
    width: 960,
    height: 960,
    themeColors: true,
});
// Layout algorithm for Sankey diagram
class SankeyLayout {
    constructor(data, settings) {
        this.nodes = new Map();
        this.flows = [];
        this.data = data;
        this.settings = settings;
    }
    // Calculate layout
    calculate() {
        this.assignLevels();
        this.calculateNodeSizes();
        this.positionNodes();
        this.calculateFlowPositions();
        this.generateFlows();
        return {
            nodes: Array.from(this.nodes.values()),
            flows: this.flows,
        };
    }
    // Assign nodes to levels (columns)
    assignLevels() {
        const nodeIncoming = new Map();
        const nodeOutgoing = new Map();
        const allNodes = new Set();
        // Initialize
        this.data.forEach((flow) => {
            allNodes.add(flow.from);
            allNodes.add(flow.to);
            if (!nodeIncoming.has(flow.to))
                nodeIncoming.set(flow.to, 0);
            nodeIncoming.set(flow.to, nodeIncoming.get(flow.to) + 1);
            if (!nodeOutgoing.has(flow.from))
                nodeOutgoing.set(flow.from, new Set());
            nodeOutgoing.get(flow.from).add(flow.to);
        });
        // Find source nodes (no incoming connections)
        const queue = [];
        const levels = new Map();
        allNodes.forEach((node) => {
            if (!nodeIncoming.has(node) || nodeIncoming.get(node) === 0) {
                queue.push(node);
                levels.set(node, 0);
            }
        });
        // Assign levels using topological sort
        while (queue.length > 0) {
            const current = queue.shift();
            const currentLevel = levels.get(current);
            if (nodeOutgoing.has(current)) {
                nodeOutgoing.get(current).forEach((target) => {
                    const newLevel = currentLevel + 1;
                    const existingLevel = levels.get(target) || 0;
                    if (newLevel > existingLevel) {
                        levels.set(target, newLevel);
                    }
                    const remaining = nodeIncoming.get(target) - 1;
                    nodeIncoming.set(target, remaining);
                    if (remaining === 0 && !queue.includes(target)) {
                        queue.push(target);
                    }
                });
            }
        }
        // Create nodes with levels and flow references
        allNodes.forEach((nodeId) => {
            const level = levels.get(nodeId) || 0;
            const incomingFlows = this.data.filter((f) => f.to === nodeId);
            const outgoingFlows = this.data.filter((f) => f.from === nodeId);
            this.nodes.set(nodeId, {
                id: nodeId,
                x: 0,
                y: 0,
                width: this.settings.nodeWidth,
                height: 0,
                color: this.getNodeColor(nodeId),
                totalValue: 0,
                level: level,
                incomingFlows,
                outgoingFlows,
            });
        });
    }
    // Calculate node sizes based on flow values
    calculateNodeSizes() {
        const nodeValues = new Map();
        // Calculate total value for each node (sum of all flows through it)
        this.data.forEach((flow) => {
            const fromValue = nodeValues.get(flow.from) || 0;
            const toValue = nodeValues.get(flow.to) || 0;
            // For source nodes, use outgoing flow total
            // For intermediate/sink nodes, use incoming flow total
            nodeValues.set(flow.from, fromValue + flow.value);
            nodeValues.set(flow.to, toValue + flow.value);
        });
        // For nodes with both incoming and outgoing, use the maximum
        this.nodes.forEach((node, nodeId) => {
            const incomingTotal = node.incomingFlows.reduce((sum, f) => sum + f.value, 0);
            const outgoingTotal = node.outgoingFlows.reduce((sum, f) => sum + f.value, 0);
            nodeValues.set(nodeId, Math.max(incomingTotal, outgoingTotal));
        });
        // Find max value for scaling
        const maxValue = Math.max(...nodeValues.values());
        const minHeight = 30;
        const maxHeight = this.settings.height * 0.7;
        // Set node heights
        this.nodes.forEach((node, nodeId) => {
            const value = nodeValues.get(nodeId) || 0;
            const height = Math.max(minHeight, (value / maxValue) * maxHeight);
            node.height = height;
            node.totalValue = value;
        });
    }
    // Position nodes in the layout
    positionNodes() {
        const levels = new Map();
        // Group nodes by level
        this.nodes.forEach((node) => {
            if (!levels.has(node.level)) {
                levels.set(node.level, []);
            }
            levels.get(node.level).push(node);
        });
        const maxLevel = Math.max(...levels.keys());
        const levelWidth = Math.max(100, (this.settings.width - this.settings.nodeWidth) / Math.max(1, maxLevel));
        // Position each level
        levels.forEach((levelNodes, level) => {
            // Sort nodes by total value (largest first) for better visual balance
            levelNodes.sort((a, b) => b.totalValue - a.totalValue);
            // Calculate total height needed
            const totalHeight = levelNodes.reduce((sum, node) => sum + node.height, 0);
            const totalSpacing = (levelNodes.length - 1) * this.settings.nodePadding;
            // Center the nodes vertically with padding
            const padding = 40;
            let currentY = Math.max(padding, (this.settings.height - totalHeight - totalSpacing) / 2);
            levelNodes.forEach((node) => {
                node.x = level * levelWidth + padding;
                node.y = Math.max(padding, currentY);
                currentY += node.height + this.settings.nodePadding;
            });
        });
    }
    // Calculate flow positions on nodes
    calculateFlowPositions() {
        this.nodes.forEach((node) => {
            // Sort flows by value for consistent positioning
            node.outgoingFlows.sort((a, b) => b.value - a.value);
            node.incomingFlows.sort((a, b) => b.value - a.value);
        });
    }
    // Generate flow paths with proper positioning
    generateFlows() {
        const flowPositions = new Map();
        // Initialize flow positions for each node
        this.nodes.forEach((node) => {
            flowPositions.set(node.id, { outgoingY: node.y, incomingY: node.y });
        });
        this.flows = this.data.map((flowData) => {
            const fromNode = this.nodes.get(flowData.from);
            const toNode = this.nodes.get(flowData.to);
            // Calculate flow thickness based on value
            const maxValue = Math.max(...this.data.map((f) => f.value));
            const thickness = Math.max(2, Math.min(30, (flowData.value / maxValue) * 25));
            // Get current flow positions
            const fromPos = flowPositions.get(flowData.from);
            const toPos = flowPositions.get(flowData.to);
            // Calculate flow endpoints
            const fromX = fromNode.x + fromNode.width;
            const fromY = fromPos.outgoingY + thickness / 2;
            const toX = toNode.x;
            const toY = toPos.incomingY + thickness / 2;
            // Update positions for next flows
            fromPos.outgoingY += thickness + 2;
            toPos.incomingY += thickness + 2;
            // Create smooth Bézier curve
            const controlPoint1X = fromX + (toX - fromX) * 0.4;
            const controlPoint2X = fromX + (toX - fromX) * 0.6;
            const path = `M ${fromX} ${fromY} C ${controlPoint1X} ${fromY} ${controlPoint2X} ${toY} ${toX} ${toY}`;
            return {
                from: flowData.from,
                to: flowData.to,
                value: flowData.value,
                color: this.getFlowColor(flowData.from, flowData.to),
                path: path,
                fromY: fromY,
                toY: toY,
                thickness: thickness,
            };
        });
    }
    // Get color for node based on its position/category
    getNodeColor(nodeId) {
        const hash = this.hashCode(nodeId);
        const colorIndex = Math.abs(hash) % this.settings.colors.length;
        return this.settings.colors[colorIndex];
    }
    // Get color for flow (gradient between from and to nodes)
    getFlowColor(fromId, toId) {
        return this.getNodeColor(fromId);
    }
    // Simple hash function for consistent coloring
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }
}
// Create Figma elements with enhanced styling
function createSankeyChart(data, settings) {
    // Create main frame
    const frame = figma.createFrame();
    frame.name = "Sankey Chart";
    frame.resize(settings.width, settings.height);
    frame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
    frame.cornerRadius = 0;
    // Calculate layout
    const layout = new SankeyLayout(data, settings);
    const { nodes, flows } = layout.calculate();
    // Create gradient definitions for each flow if gradients enabled
    const gradients = [];
    if (settings.enableGradients) {
        flows.forEach((flow, index) => {
            const fromNode = nodes.find((n) => n.id === flow.from);
            const toNode = nodes.find((n) => n.id === flow.to);
            const gradient = {
                type: "GRADIENT_LINEAR",
                gradientTransform: [
                    [1, 0, 0],
                    [0, 1, 0],
                ],
                gradientStops: [
                    {
                        position: 0,
                        color: {
                            ...hexToRgb(fromNode.color),
                            a: settings.flowOpacity || 0.6,
                        },
                    },
                    {
                        position: 1,
                        color: {
                            ...hexToRgb(toNode.color),
                            a: settings.flowOpacity || 0.6,
                        },
                    },
                ],
            };
            gradients.push(gradient);
        });
    }
    // Create flows using vector paths for smooth curves
    flows.forEach((flow, index) => {
        try {
            const vector = figma.createVector();
            vector.name = `Flow: ${flow.from} → ${flow.to} (${flow.value})`;
            // Create smooth path with proper thickness
            const fromNode = nodes.find((n) => n.id === flow.from);
            const toNode = nodes.find((n) => n.id === flow.to);
            // Calculate control points for smoother curves
            const fromX = fromNode.x + fromNode.width;
            const fromY = flow.fromY;
            const toX = toNode.x;
            const toY = flow.toY;
            const controlPointOffset = Math.min(150, (toX - fromX) * 0.5);
            const controlPoint1X = fromX + controlPointOffset;
            const controlPoint2X = toX - controlPointOffset;
            // Create path with thickness
            const topPath = `M ${fromX} ${fromY - flow.thickness / 2} C ${controlPoint1X} ${fromY - flow.thickness / 2} ${controlPoint2X} ${toY - flow.thickness / 2} ${toX} ${toY - flow.thickness / 2}`;
            const bottomPath = `L ${toX} ${toY + flow.thickness / 2} C ${controlPoint2X} ${toY + flow.thickness / 2} ${controlPoint1X} ${fromY + flow.thickness / 2} ${fromX} ${fromY + flow.thickness / 2}`;
            const fullPath = `${topPath} ${bottomPath} Z`;
            // Create vector path
            vector.vectorPaths = [
                {
                    windingRule: "NONZERO",
                    data: fullPath,
                },
            ];
            // Apply gradient or solid fill
            if (settings.enableGradients && gradients[index]) {
                vector.fills = [gradients[index]];
            }
            else {
                vector.fills = [
                    {
                        type: "SOLID",
                        color: hexToRgb(flow.color),
                        opacity: settings.flowOpacity || 0.6,
                    },
                ];
            }
            frame.appendChild(vector);
        }
        catch (error) {
            console.warn("Vector creation failed, using fallback");
            // Fallback implementation remains the same
        }
    });
    // Create nodes with modern styling
    nodes.forEach((node) => {
        // Node rectangle with gradient
        const nodeRect = figma.createRectangle();
        nodeRect.name = `${node.id}`;
        nodeRect.resize(node.width, node.height);
        nodeRect.x = node.x;
        nodeRect.y = node.y;
        // Apply gradient fill to nodes
        if (settings.enableGradients) {
            const nodeGradient = {
                type: "GRADIENT_LINEAR",
                gradientTransform: [
                    [1, 0, 0],
                    [0, 1, 0],
                ],
                gradientStops: [
                    {
                        position: 0,
                        color: { ...hexToRgb(node.color), a: 1 },
                    },
                    {
                        position: 1,
                        color: { ...hexToRgb(node.color), a: 0.8 },
                    },
                ],
            };
            nodeRect.fills = [nodeGradient];
        }
        else {
            nodeRect.fills = [
                {
                    type: "SOLID",
                    color: hexToRgb(node.color),
                },
            ];
        }
        nodeRect.cornerRadius = 0;
        // Node label with better positioning
        const textNode = figma.createText();
        textNode.name = `${node.id} Label`;
        // Load font and set text
        figma
            .loadFontAsync({ family: "Inter", style: "Medium" })
            .then(() => {
            textNode.fontName = { family: "Inter", style: "Medium" };
            textNode.characters = node.id;
            textNode.fontSize = 14;
            textNode.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
            // Position text centered vertically next to node
            textNode.x = node.x + node.width + 16;
            textNode.y = node.y + (node.height - textNode.height) / 2;
            frame.appendChild(textNode);
        })
            .catch(() => {
            // Fallback without Inter font
            textNode.characters = node.id;
            textNode.fontSize = 14;
            textNode.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
            textNode.x = node.x + node.width + 16;
            textNode.y = node.y + (node.height - textNode.height) / 2;
            frame.appendChild(textNode);
        });
        frame.appendChild(nodeRect);
    });
    // Position frame in viewport
    frame.x = figma.viewport.center.x - settings.width / 2;
    frame.y = figma.viewport.center.y - settings.height / 2;
    // Select the created frame
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
}
// Utility function to convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        }
        : { r: 0, g: 0, b: 0 };
}
// Handle messages from UI
figma.ui.onmessage = (msg) => {
    if (msg.type === "generate-chart") {
        try {
            createSankeyChart(msg.data, msg.settings);
            figma.notify("✅ Sankey chart generated successfully!");
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            figma.notify("❌ Error generating chart: " + errorMessage);
        }
    }
    if (msg.type === "clear-canvas") {
        // Remove all existing sankey charts
        const sankeyFrames = figma.currentPage.children.filter((node) => node.type === "FRAME" && node.name.includes("Sankey Chart"));
        sankeyFrames.forEach((frame) => frame.remove());
        figma.notify(`🧹 Cleared ${sankeyFrames.length} chart(s) from canvas`);
    }
    if (msg.type === "notification") {
        figma.notify(msg.message);
    }
};
// Handle plugin close
figma.on("close", () => {
    // Plugin cleanup if needed
});

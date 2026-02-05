import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BpmnModdle } from 'bpmn-moddle';

interface BpmnViewerProps {
    xml: string;
}

const BpmnViewer: React.FC<BpmnViewerProps> = ({ xml }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!xml || !containerRef.current) return;

        const render = async () => {
            setError(null);
            try {
                const moddle = new BpmnModdle();
                const { rootElement, warnings } = await moddle.fromXML(xml);

                if (warnings && warnings.length > 0) {
                    console.warn('BPMN Moddle Warnings:', warnings);
                }

                // Clear previous SVG
                d3.select(containerRef.current).selectAll('*').remove();

                const width = 800; // TODO: make dynamic based on content
                const height = 600;

                const svg = d3.select(containerRef.current)
                    .append('svg')
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .attr('viewBox', `0 0 ${width} ${height}`)
                    .style('border', '1px solid #ccc');

                // Extract DI (Diagram Interchange) information
                // rootElement.diagrams -> BPMNDiagram -> BPMNPlane -> planeElement

                // Note: TypeScript might not fully know the structure of rootElement.diagrams
                // We'll cast to any for now to traverse, or define strict interfaces if needed.
                const diagrams = (rootElement as any).diagrams;
                if (!diagrams || diagrams.length === 0) {
                    setError('No diagrams found in BPMN file.');
                    return;
                }

                const plane = diagrams[0].plane;
                const elements = plane.planeElement;

                if (!elements) {
                    setError('No plane elements found.');
                    return;
                }

                // --- Rendering Logic ---
                // We need to iterate over DI elements and render them.
                // Each DI element references a BPMN element (bpmnElement).

                // Draw Edges first (so they are behind nodes)
                const edges = elements.filter((e: any) => e.$type === 'bpmndi:BPMNEdge');
                const shapes = elements.filter((e: any) => e.$type === 'bpmndi:BPMNShape');

                // Render Edges
                svg.selectAll('.edge')
                    .data(edges)
                    .enter()
                    .append('path')
                    .attr('class', 'edge')
                    .attr('d', (d: any) => {
                        // d.waypoint is an array of {x, y}
                        const line = d3.line()
                            .x((p: any) => p.x)
                            .y((p: any) => p.y);
                        return line(d.waypoint);
                    })
                    .attr('fill', 'none')
                    .attr('stroke', '#000')
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)');

                // Define Arrowhead marker
                svg.append('defs').append('marker')
                    .attr('id', 'arrowhead')
                    .attr('viewBox', '0 -5 10 10')
                    .attr('refX', 10)
                    .attr('refY', 0)
                    .attr('markerWidth', 6)
                    .attr('markerHeight', 6)
                    .attr('orient', 'auto')
                    .append('path')
                    .attr('d', 'M0,-5L10,0L0,5')
                    .attr('fill', '#000');


                // Separate containers (Pools/Lanes) from other nodes to handle z-indexing (render containers first)
                const isContainer = (type: string) => type.includes('Participant') || type.includes('Lane');

                const containers = shapes.filter((d: any) => d.bpmnElement && isContainer(d.bpmnElement.$type));
                const nodes = shapes.filter((d: any) => d.bpmnElement && !isContainer(d.bpmnElement.$type));

                // Helper to render shapes
                const renderShape = (selection: any) => {
                    selection.each(function (d: any) {
                        const g = d3.select(this);
                        const bpmnElement = d.bpmnElement;
                        const type = bpmnElement.$type;
                        const { width, height } = d.bounds;

                        // Basic rendering based on type
                        if (type.includes('Task') || type.includes('Activity')) {
                            // Rounded Rectangle
                            g.append('rect')
                                .attr('width', width)
                                .attr('height', height)
                                .attr('rx', 10)
                                .attr('ry', 10)
                                .attr('fill', '#fff')
                                .attr('stroke', '#000')
                                .attr('stroke-width', 2);

                            // Label
                            if (bpmnElement.name) {
                                g.append('text')
                                    .attr('x', width / 2)
                                    .attr('y', height / 2)
                                    .attr('text-anchor', 'middle')
                                    .attr('dy', '.3em')
                                    .style('font-size', '12px')
                                    .text(bpmnElement.name);
                            }

                        } else if (type.includes('Event')) {
                            // Circle
                            const r = Math.min(width, height) / 2;
                            g.append('circle')
                                .attr('cx', width / 2)
                                .attr('cy', height / 2)
                                .attr('r', r)
                                .attr('fill', '#fff')
                                .attr('stroke', '#000')
                                .attr('stroke-width', 2);

                            // Label
                            if (bpmnElement.name) {
                                g.append('text')
                                    .attr('x', width / 2)
                                    .attr('y', height + 15)
                                    .attr('text-anchor', 'middle')
                                    .style('font-size', '11px')
                                    .text(bpmnElement.name);
                            }
                        } else if (type.includes('Gateway')) {
                            // Diamond
                            g.append('polygon')
                                .attr('points', `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`)
                                .attr('fill', '#fff')
                                .attr('stroke', '#000')
                                .attr('stroke-width', 2);

                            // Label (add support for Gateway labels)
                            if (bpmnElement.name) {
                                g.append('text')
                                    .attr('x', width / 2)
                                    .attr('y', height + 15)
                                    .attr('text-anchor', 'middle')
                                    .style('font-size', '11px')
                                    .text(bpmnElement.name);
                            }

                        } else if (type.includes('Participant') || type.includes('Lane')) {
                            // Pool / Lane
                            // We assume horizontal for now.
                            // Horizontal needs label on left, rotated -90

                            g.append('rect')
                                .attr('width', width)
                                .attr('height', height)
                                .attr('fill', 'none') // Transparent background
                                .attr('stroke', '#000')
                                .attr('stroke-width', 2);

                            // Label
                            if (bpmnElement.name) {
                                // Simple check for horizontal: width > height often implies horizontal in classic layouts
                                // But officially we should check "isHorizontal" attribute in DI if available, or assume Horizontal
                                const isHorizontal = d.isHorizontal !== false;

                                if (isHorizontal) {
                                    g.append('text')
                                        .attr('x', 15)
                                        .attr('y', height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('transform', `rotate(-90, 15, ${height / 2})`)
                                        .style('font-size', '12px')
                                        .text(bpmnElement.name);
                                } else {
                                    // Vertical
                                    g.append('text')
                                        .attr('x', width / 2)
                                        .attr('y', 15)
                                        .attr('text-anchor', 'middle')
                                        .style('font-size', '12px')
                                        .text(bpmnElement.name);
                                }
                            }
                        } else {
                            // Fallback
                            g.append('rect')
                                .attr('width', width)
                                .attr('height', height)
                                .attr('fill', '#eee')
                                .attr('stroke', '#999')
                                .attr('stroke-dasharray', '4 4');
                            g.append('text')
                                .attr('x', 0)
                                .attr('y', -5)
                                .text(type.replace('bpmn:', ''));
                        }
                    });
                };

                // Render Containers FIRST
                const containerGroup = svg.selectAll('.container')
                    .data(containers)
                    .enter()
                    .append('g')
                    .attr('class', 'container')
                    .attr('transform', (d: any) => `translate(${d.bounds.x}, ${d.bounds.y})`);

                renderShape(containerGroup);

                // Render Nodes SECOND
                const nodeGroup = svg.selectAll('.node')
                    .data(nodes)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('transform', (d: any) => `translate(${d.bounds.x}, ${d.bounds.y})`);

                renderShape(nodeGroup);


            } catch (err: any) {
                console.error(err);
                setError('Failed to parse BPMN: ' + err.message);
            }
        };

        render();

    }, [xml]);

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {error && <div style={{ color: 'red', padding: '10px' }}>{error}</div>}
            <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />
        </div>
    );
};

export default BpmnViewer;

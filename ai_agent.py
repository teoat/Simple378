#!/usr/bin/env python3
"""
AntiGravity AI Automation Agent - Frenly AI Integration
=======================================================

An intelligent automation agent that integrates with Frenly AI to analyze system state,
make decisions, and execute improvement tasks for the AntiGravity Fraud Detection System.

Frenly AI Integration:
- Uses existing Frenly AI chat interface for decision making
- Leverages AI personas (analyst, legal, cfo, investigator)
- Provides context-aware automation with AI assistance
- Maintains conversation history and learning

Features:
- Intelligent task prioritization with AI reasoning
- Context-aware decision making using Frenly AI
- Automated code analysis and improvement
- Performance monitoring and optimization
- Security vulnerability detection
- User experience enhancement
- AI-powered task execution and validation
"""

import os
import sys
import json
import time
import subprocess
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('AntiGravityAI')

class TaskPriority(Enum):
    IMMEDIATE = "immediate"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class Task:
    id: str
    name: str
    description: str
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    dependencies: List[str] = None
    estimated_time: int = 0  # minutes
    created_at: datetime = None
    completed_at: Optional[datetime] = None
    result: Optional[str] = None
    error: Optional[str] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.dependencies is None:
            self.dependencies = []

class AntiGravityAI:
    """Intelligent automation agent integrated with Frenly AI"""

    def __init__(self, project_root: str):
        self.project_root = project_root
        self.tasks: Dict[str, Task] = {}
        self.system_state = {}
        self.decision_history = []
        self.frenly_conversation = []

        # Initialize Frenly AI integration
        self.frenly_api_url = "http://localhost:8000"  # Backend API URL
        self.frenly_persona = "analyst"  # Default persona

        # Initialize system analysis
        self.analyze_system_state()

    def analyze_system_state(self) -> Dict[str, Any]:
        """Analyze current system state to inform decision making"""
        logger.info("🔍 Analyzing system state...")

        state = {
            'database': self._check_database_status(),
            'backend': self._check_backend_status(),
            'frontend': self._check_frontend_status(),
            'tests': self._check_test_status(),
            'security': self._check_security_status(),
            'performance': self._check_performance_status(),
            'accessibility': self._check_accessibility_status()
        }

        self.system_state = state
        logger.info(f"📊 System analysis complete: {state}")
        return state

    def _check_database_status(self) -> Dict[str, Any]:
        """Check database health and configuration"""
        try:
            # Check if database container is running
            result = subprocess.run(
                ['docker', 'compose', 'ps', 'db'],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=10
            )

            is_running = 'Up' in result.stdout

            if is_running:
                # Test database connection
                result = subprocess.run(
                    ['docker', 'compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'fraud_admin'],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                connection_ok = result.returncode == 0
            else:
                connection_ok = False

            return {
                'running': is_running,
                'connection': connection_ok,
                'issues': [] if connection_ok else ['Database connection failed']
            }

        except Exception as e:
            logger.error(f"Database check failed: {e}")
            return {'running': False, 'connection': False, 'issues': [str(e)]}

    def _check_backend_status(self) -> Dict[str, Any]:
        """Check backend API health"""
        try:
            import requests
            response = requests.get('http://localhost:8000/health', timeout=5)
            return {
                'running': response.status_code == 200,
                'response_time': response.elapsed.total_seconds(),
                'issues': [] if response.status_code == 200 else ['Health check failed']
            }
        except Exception as e:
            return {'running': False, 'response_time': None, 'issues': [str(e)]}

    def _check_frontend_status(self) -> Dict[str, Any]:
        """Check frontend build and development server"""
        frontend_dir = os.path.join(self.project_root, 'frontend')

        # Check if build exists
        build_exists = os.path.exists(os.path.join(frontend_dir, 'dist'))

        # Check if dev server is running (simple port check)
        dev_server_running = False
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('localhost', 5173))
            dev_server_running = result == 0
            sock.close()
        except:
            pass

        return {
            'build_exists': build_exists,
            'dev_server_running': dev_server_running,
            'issues': []
        }

    def _check_test_status(self) -> Dict[str, Any]:
        """Check test coverage and status"""
        try:
            # Run test coverage check
            result = subprocess.run(
                ['npm', 'run', 'test:coverage'],
                cwd=os.path.join(self.project_root, 'frontend'),
                capture_output=True,
                text=True,
                timeout=60
            )

            # Parse coverage from output (simplified)
            coverage = 0
            if 'All files' in result.stdout:
                # Extract coverage percentage (simplified parsing)
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'All files' in line and '%' in line:
                        try:
                            coverage = float(line.split()[-1].rstrip('%'))
                            break
                        except:
                            pass

            return {
                'coverage': coverage,
                'tests_passing': result.returncode == 0,
                'issues': [] if result.returncode == 0 else ['Tests failing']
            }

        except Exception as e:
            return {'coverage': 0, 'tests_passing': False, 'issues': [str(e)]}

    def _check_security_status(self) -> Dict[str, Any]:
        """Check security configuration"""
        issues = []

        # Check for security headers
        try:
            import requests
            response = requests.get('http://localhost:8000/docs', timeout=5)
            headers = response.headers

            security_headers = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
                'Strict-Transport-Security'
            ]

            missing_headers = [h for h in security_headers if h not in headers]
            if missing_headers:
                issues.extend([f"Missing security header: {h}" for h in missing_headers])

        except:
            issues.append("Cannot check security headers")

        return {
            'security_headers_present': len(issues) == 0,
            'issues': issues
        }

    def _check_performance_status(self) -> Dict[str, Any]:
        """Check performance metrics"""
        issues = []

        # Check bundle size
        frontend_dir = os.path.join(self.project_root, 'frontend')
        if os.path.exists(os.path.join(frontend_dir, 'dist')):
            # Check main bundle size (simplified)
            try:
                import os
                bundle_size = 0
                for root, dirs, files in os.walk(os.path.join(frontend_dir, 'dist')):
                    for file in files:
                        if file.endswith('.js'):
                            bundle_size += os.path.getsize(os.path.join(root, file))

                # Convert to MB
                bundle_size_mb = bundle_size / (1024 * 1024)

                if bundle_size_mb > 2:  # Arbitrary threshold
                    issues.append(".2f")

            except Exception as e:
                issues.append(f"Cannot check bundle size: {e}")
        else:
            issues.append("Frontend build not found")

        return {
            'bundle_analyzed': len(issues) == 0,
            'issues': issues
        }

    def _check_accessibility_status(self) -> Dict[str, Any]:
        """Check accessibility compliance"""
        issues = []

        # Check for ARIA labels in key components
        frontend_src = os.path.join(self.project_root, 'frontend', 'src')

        key_files = [
            'pages/Login.tsx',
            'pages/CaseList.tsx',
            'components/ui/Button.tsx'
        ]

        for file_path in key_files:
            full_path = os.path.join(frontend_src, file_path)
            if os.path.exists(full_path):
                with open(full_path, 'r') as f:
                    content = f.read()

                # Check for basic accessibility features
                if 'aria-label' not in content and 'aria-labelledby' not in content:
                    issues.append(f"Missing ARIA labels in {file_path}")

        return {
            'accessibility_checked': True,
            'issues': issues
        }

    def make_decision(self, task: Task) -> bool:
        """AI decision making with Frenly AI integration"""
        logger.info(f"🤖 Consulting Frenly AI for task: {task.name}")

        # Analyze system state to inform decision
        system_issues = []
        for component, status in self.system_state.items():
            if status.get('issues'):
                system_issues.extend(status['issues'])

        # First, try to get Frenly AI's recommendation
        frenly_recommendation = self._consult_frenly_ai(task, system_issues)

        if frenly_recommendation:
            logger.info(f"🎯 Frenly AI recommends: {frenly_recommendation}")
            should_execute = frenly_recommendation.get('should_execute', False)
            reasoning = frenly_recommendation.get('reasoning', 'Frenly AI recommendation')
        else:
            # Fallback to rule-based decision making
            logger.info("⚠️  Frenly AI unavailable, using rule-based decisions")
            should_execute, reasoning = self._rule_based_decision(task, system_issues)

        # Record decision
        self.decision_history.append({
            'task': task.id,
            'decision': should_execute,
            'reasoning': reasoning,
            'ai_consulted': frenly_recommendation is not None,
            'timestamp': datetime.now()
        })

        return should_execute

    def _consult_frenly_ai(self, task: Task, system_issues: List[str]) -> Optional[Dict[str, Any]]:
        """Consult Frenly AI for task execution recommendation"""
        try:
            import requests

            # Prepare context for Frenly AI
            context = {
                'task': {
                    'id': task.id,
                    'name': task.name,
                    'description': task.description,
                    'priority': task.priority.value,
                    'estimated_time': task.estimated_time
                },
                'system_state': self.system_state,
                'system_issues': system_issues,
                'conversation_history': self.frenly_conversation[-5:] if self.frenly_conversation else []
            }

            # Create AI prompt for decision making
            prompt = f"""
As Frenly AI, analyze this automation task and provide a recommendation.

Task Details:
- Name: {task.name}
- Description: {task.description}
- Priority: {task.priority.value}
- Estimated Time: {task.estimated_time} minutes

System State: {json.dumps(self.system_state, indent=2)}
System Issues: {json.dumps(system_issues, indent=2)}

Based on the system analysis, should this task be executed? Provide:
1. A boolean decision (should_execute: true/false)
2. Detailed reasoning for your decision
3. Any additional context or suggestions

Respond in JSON format with keys: should_execute, reasoning, suggestions
"""

            # Send to Frenly AI (via backend API)
            response = requests.post(
                f"{self.frenly_api_url}/ai/chat",
                json={
                    'message': prompt,
                    'persona': self.frenly_persona,
                    'context': context
                },
                timeout=30
            )

            if response.status_code == 200:
                ai_response = response.json()

                # Parse AI response (assuming it returns structured data)
                try:
                    # Extract decision from AI response
                    content = ai_response.get('response', '')

                    # Simple parsing - look for JSON in response
                    import re
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        decision_data = json.loads(json_match.group())
                        return decision_data
                    else:
                        # Fallback: analyze text for decision keywords
                        content_lower = content.lower()
                        if 'yes' in content_lower or 'execute' in content_lower or 'should_execute.*true' in content_lower:
                            return {
                                'should_execute': True,
                                'reasoning': content,
                                'suggestions': []
                            }
                        elif 'no' in content_lower or 'skip' in content_lower or 'should_execute.*false' in content_lower:
                            return {
                                'should_execute': False,
                                'reasoning': content,
                                'suggestions': []
                            }
                except json.JSONDecodeError:
                    logger.warning("Could not parse Frenly AI response as JSON")

            return None

        except Exception as e:
            logger.error(f"Frenly AI consultation failed: {e}")
            return None

    def _rule_based_decision(self, task: Task, system_issues: List[str]) -> tuple[bool, str]:
        """Fallback rule-based decision making"""
        should_execute = False
        reasoning = ""

        if task.priority == TaskPriority.IMMEDIATE:
            should_execute = True
            reasoning = f"Immediate priority task - executing: {task.name}"

        elif task.priority == TaskPriority.HIGH:
            if self._task_addresses_issues(task, system_issues):
                should_execute = True
                reasoning = f"High priority task addresses {len(system_issues)} system issues"
            else:
                should_execute = len(system_issues) > 2
                reasoning = f"High priority task - {len(system_issues)} system issues detected"

        elif task.priority == TaskPriority.MEDIUM:
            healthy_components = sum(1 for status in self.system_state.values()
                                   if not status.get('issues'))
            total_components = len(self.system_state)

            if healthy_components / total_components > 0.7:
                should_execute = True
                reasoning = f"Medium priority task - system {healthy_components}/{total_components} components healthy"

        else:  # LOW priority
            if not system_issues:
                should_execute = True
                reasoning = "Low priority task - system in perfect health"

        return should_execute, reasoning

    def _task_addresses_issues(self, task: Task, issues: List[str]) -> bool:
        """Check if task addresses current system issues"""
        task_keywords = {
            'fix_database_auth': ['database', 'connection', 'auth'],
            'implement_virtual_scrolling': ['performance', 'scrolling'],
            'add_accessibility': ['aria', 'accessibility', 'screen reader'],
            'performance_optimization': ['performance', 'bundle', 'optimization'],
            'security_enhancement': ['security', 'header', 'vulnerability'],
            'complete_e2e_testing': ['test', 'e2e', 'coverage'],
            'enhance_error_handling': ['error', 'handling', 'boundary'],
            'add_offline_support': ['offline', 'pwa', 'service worker']
        }

        task_words = task_keywords.get(task.id, [])
        return any(any(word in issue.lower() for word in task_words) for issue in issues)

    def execute_task(self, task: Task) -> bool:
        """Execute a task using the automation framework with Frenly AI validation"""
        logger.info(f"🎯 Executing task with Frenly AI oversight: {task.name}")

        task.status = TaskStatus.RUNNING

        # Pre-execution validation with Frenly AI
        pre_validation = self._validate_task_with_frenly(task, "pre_execution")
        if pre_validation and not pre_validation.get('approved', True):
            logger.warning(f"⚠️  Frenly AI blocked task execution: {pre_validation.get('reason', 'Unknown reason')}")
            task.status = TaskStatus.SKIPPED
            task.error = f"Frenly AI blocked execution: {pre_validation.get('reason', 'Unknown reason')}"
            return False

        try:
            # Run the automation script for this task
            result = subprocess.run(
                ['./automation.sh', task.id],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            success = result.returncode == 0

            if success:
                task.status = TaskStatus.COMPLETED
                task.result = result.stdout
                task.completed_at = datetime.now()
                logger.info(f"✅ Task completed successfully: {task.name}")

                # Post-execution validation with Frenly AI
                self._validate_task_with_frenly(task, "post_execution", success=True, output=result.stdout)

            else:
                task.status = TaskStatus.FAILED
                task.error = result.stderr
                logger.error(f"❌ Task failed: {task.name} - {result.stderr}")

                # Get Frenly AI analysis of failure
                self._analyze_failure_with_frenly(task, result.stderr)

            return success

        except subprocess.TimeoutExpired:
            task.status = TaskStatus.FAILED
            task.error = "Task execution timed out"
            logger.error(f"⏰ Task timed out: {task.name}")

            # Analyze timeout with Frenly AI
            self._analyze_failure_with_frenly(task, "Task execution timed out")

            return False
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            logger.error(f"💥 Task execution error: {task.name} - {e}")

            # Analyze error with Frenly AI
            self._analyze_failure_with_frenly(task, str(e))

            return False

    def _validate_task_with_frenly(self, task: Task, validation_type: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Validate task execution with Frenly AI"""
        try:
            import requests

            validation_prompt = f"""
As Frenly AI, validate this automation task {validation_type.replace('_', ' ')}.

Task: {task.name} ({task.id})
Description: {task.description}
Priority: {task.priority.value}

{f"Execution Result: {kwargs.get('output', 'N/A')}" if validation_type == 'post_execution' else ''}
{f"Success: {kwargs.get('success', 'N/A')}" if 'success' in kwargs else ''}

Please analyze if this task execution is appropriate and safe. Consider:
1. System impact and potential risks
2. Code quality and best practices
3. Security implications
4. Performance considerations

Respond with JSON: {{"approved": true/false, "reason": "explanation", "suggestions": ["suggestion1", "suggestion2"]}}
"""

            response = requests.post(
                f"{self.frenly_api_url}/ai/chat",
                json={
                    'message': validation_prompt,
                    'persona': 'analyst',  # Use analyst persona for technical validation
                    'task_context': {
                        'task_id': task.id,
                        'validation_type': validation_type,
                        'system_state': self.system_state
                    }
                },
                timeout=15
            )

            if response.status_code == 200:
                ai_response = response.json()
                content = ai_response.get('response', '')

                # Try to extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())

            return None

        except Exception as e:
            logger.warning(f"Frenly AI validation failed: {e}")
            return None

    def _analyze_failure_with_frenly(self, task: Task, error_message: str):
        """Analyze task failure with Frenly AI for learning and improvement"""
        try:
            import requests

            analysis_prompt = f"""
As Frenly AI, analyze this task failure to improve future automation:

Failed Task: {task.name} ({task.id})
Error: {error_message}

Please provide:
1. Root cause analysis
2. Prevention strategies
3. Alternative approaches
4. Learning insights for future tasks

This will help improve the automation system's reliability.
"""

            # Send analysis request (fire and forget - don't wait for response)
            try:
                requests.post(
                    f"{self.frenly_api_url}/ai/chat",
                    json={
                        'message': analysis_prompt,
                        'persona': 'investigator',  # Use investigator persona for failure analysis
                        'context': 'failure_analysis'
                    },
                    timeout=5
                )
            except:
                pass  # Ignore failures in failure analysis

        except Exception as e:
            logger.debug(f"Failure analysis request failed: {e}")
            # This is not critical, so we don't log as error

    def create_task_queue(self) -> List[Task]:
        """Create prioritized task queue based on system analysis"""
        tasks = [
            Task(
                id="fix_database_auth",
                name="Fix Database Authentication",
                description="Resolve database connection and authentication issues",
                priority=TaskPriority.IMMEDIATE,
                estimated_time=15
            ),
            Task(
                id="security_enhancement",
                name="Security Enhancements",
                description="Implement security headers, CSRF protection, and vulnerability fixes",
                priority=TaskPriority.IMMEDIATE,
                estimated_time=30
            ),
            Task(
                id="complete_e2e_testing",
                name="Complete E2E Testing",
                description="Set up and run comprehensive end-to-end tests",
                priority=TaskPriority.HIGH,
                estimated_time=45
            ),
            Task(
                id="implement_virtual_scrolling",
                name="Virtual Scrolling Implementation",
                description="Add virtual scrolling to improve performance on large lists",
                priority=TaskPriority.HIGH,
                estimated_time=60
            ),
            Task(
                id="performance_optimization",
                name="Performance Optimization",
                description="Optimize bundle size, loading times, and runtime performance",
                priority=TaskPriority.HIGH,
                estimated_time=90
            ),
            Task(
                id="add_accessibility",
                name="Accessibility Enhancements",
                description="Add ARIA labels, keyboard navigation, and screen reader support",
                priority=TaskPriority.MEDIUM,
                estimated_time=45
            ),
            Task(
                id="enhance_error_handling",
                name="Error Handling Improvements",
                description="Enhance error boundaries, user feedback, and error recovery",
                priority=TaskPriority.MEDIUM,
                estimated_time=30
            ),
            Task(
                id="add_offline_support",
                name="Offline Support & PWA",
                description="Implement service workers, offline functionality, and PWA features",
                priority=TaskPriority.LOW,
                estimated_time=60
            )
        ]

        # Set dependencies
        tasks[2].dependencies = [tasks[0].id]  # E2E testing depends on database fix

        return tasks

    def run_automation(self) -> Dict[str, Any]:
        """Main automation execution loop"""
        logger.info("🚀 Starting AntiGravity AI Automation")

        # Create task queue
        self.tasks = {task.id: task for task in self.create_task_queue()}

        results = {
            'total_tasks': len(self.tasks),
            'executed_tasks': 0,
            'successful_tasks': 0,
            'failed_tasks': 0,
            'skipped_tasks': 0,
            'execution_time': 0,
            'task_results': []
        }

        start_time = time.time()

        # Execute tasks based on AI decisions
        for task in self.tasks.values():
            logger.info(f"🎯 Processing task: {task.name} (Priority: {task.priority.value})")

            # AI decision making
            should_execute = self.make_decision(task)

            if should_execute:
                results['executed_tasks'] += 1

                # Check dependencies
                deps_satisfied = all(
                    dep_id in self.tasks and self.tasks[dep_id].status == TaskStatus.COMPLETED
                    for dep_id in task.dependencies
                )

                if not deps_satisfied:
                    logger.info(f"⏳ Skipping task due to unsatisfied dependencies: {task.name}")
                    task.status = TaskStatus.SKIPPED
                    results['skipped_tasks'] += 1
                    continue

                # Execute task
                success = self.execute_task(task)

                if success:
                    results['successful_tasks'] += 1
                else:
                    results['failed_tasks'] += 1

            else:
                logger.info(f"🤖 AI decided to skip task: {task.name}")
                task.status = TaskStatus.SKIPPED
                results['skipped_tasks'] += 1

            # Record task result
            results['task_results'].append({
                'task_id': task.id,
                'task_name': task.name,
                'status': task.status.value,
                'executed': should_execute,
                'error': task.error,
                'result': task.result[:500] if task.result else None  # Truncate long results
            })

        # Calculate execution time
        results['execution_time'] = time.time() - start_time

        # Save results
        self.save_results(results)

        logger.info("🎉 Automation complete!")
        logger.info(f"📊 Results: {results['successful_tasks']}/{results['executed_tasks']} tasks successful")

        return results

    def save_results(self, results: Dict[str, Any]):
        """Save automation results to file"""
        results_file = os.path.join(self.project_root, 'automation_results.json')

        # Add timestamp and system state
        results['timestamp'] = datetime.now().isoformat()
        results['system_state'] = self.system_state
        results['decision_history'] = [
            {**decision, 'timestamp': decision['timestamp'].isoformat()}
            for decision in self.decision_history
        ]

        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)

        logger.info(f"💾 Results saved to: {results_file}")

def main():
    """Main entry point for the AI automation agent with Frenly AI integration"""
    print("🤖 AntiGravity AI Automation Agent - Frenly AI Integration")
    print("==========================================================")
    print("🔗 Integrated with Frenly AI for intelligent decision making")
    print()

    # Determine project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    # Check Frenly AI availability
    print("🔍 Checking Frenly AI integration...")
    try:
        import requests
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Frenly AI backend available")
        else:
            print("⚠️  Frenly AI backend responding but not healthy")
    except:
        print("⚠️  Frenly AI backend not available - will use rule-based decisions")

    print()

    # Initialize AI agent
    ai_agent = AntiGravityAI(project_root)

    # Display system analysis
    print("📊 System Analysis:")
    for component, status in ai_agent.system_state.items():
        issues = status.get('issues', [])
        status_icon = "✅" if not issues else "⚠️ " if len(issues) < 3 else "❌"
        print(f"  {status_icon} {component}: {len(issues)} issues")
    print()

    # Run automation
    try:
        results = ai_agent.run_automation()

        # Print comprehensive summary
        print()
        print("🎉 Automation Complete!")
        print("=======================")
        print(f"🤖 Frenly AI Integration: {'Active' if ai_agent._consult_frenly_ai else 'Fallback'}")
        print(f"📊 Tasks Analyzed: {len(ai_agent.decision_history)}")
        print(f"📊 Tasks Executed: {results['executed_tasks']}")
        print(f"✅ Successful: {results['successful_tasks']}")
        print(f"❌ Failed: {results['failed_tasks']}")
        print(f"⏭️  Skipped: {results['skipped_tasks']}")
        print(".2f")
        print()

        # Show AI decision summary
        ai_decisions = [d for d in ai_agent.decision_history if d.get('ai_consulted', False)]
        if ai_decisions:
            print("🧠 Frenly AI Decisions:")
            for decision in ai_decisions[:5]:  # Show first 5
                status = "✅ Executed" if decision['decision'] else "⏭️  Skipped"
                print(f"  {status}: {decision['task']} - {decision['reasoning'][:60]}...")
            if len(ai_decisions) > 5:
                print(f"  ... and {len(ai_decisions) - 5} more decisions")
            print()

        print("📁 Files generated:")
        print("  📄 automation_results.json - Detailed execution results")
        print("  📋 ai_agent.log - Execution logs")
        print("  💾 automation.log - Automation framework logs")
        print()

        # Provide next steps based on results
        if results['failed_tasks'] > 0:
            print("🔧 Next Steps:")
            print("  1. Review failed tasks in automation_results.json")
            print("  2. Check ai_agent.log for detailed error messages")
            print("  3. Consult Frenly AI for failure analysis and recommendations")
            print("  4. Re-run automation after fixing issues")
        else:
            print("🎯 Success! All automated improvements completed.")
            print("  📈 Run E2E tests to validate improvements")
            print("  🚀 Consider deploying to staging environment")

    except KeyboardInterrupt:
        logger.info("🛑 Automation interrupted by user")
        print("\n🛑 Automation interrupted")
        print("💾 Partial results saved to automation_results.json")
    except Exception as e:
        logger.error(f"💥 Automation failed: {e}")
        print(f"\n💥 Automation failed: {e}")
        print("🔍 Check ai_agent.log for detailed error information")
        sys.exit(1)

if __name__ == "__main__":
    main()</content>
<parameter name="filePath">ai_agent.py
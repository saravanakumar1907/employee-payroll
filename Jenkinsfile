
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out Employee Payroll source code'
                checkout scm
            }
        }

        stage('Verify Project Files') {
            steps {
                sh '''
                    set -eu

                    echo "Checking Docker Compose configuration..."
                    test -f docker-compose.yml -o -f compose.yml

                    echo "Checking frontend..."
                    test -d frontend

                    echo "Checking backend..."
                    test -d backend

                    echo "Project file verification successful."
                '''
            }
        }
    }

    post {
        success {
            echo 'Employee Payroll CI pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the console output.'
        }
    }
}

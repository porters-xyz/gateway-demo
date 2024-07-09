# POKT Gateway Demo

Work related to https://forum.pokt.network/t/open-priority-gateway-demo/4874

## Proposal

### ⚔️ Raid Guild Proposal <> POKT OPEN PRIORITY: Gateway Demo  ⚔️

> Building a User-facing Demo Gateway on top of the Nodies Gateway Kit

##### Scope of Work
This Raid Party proposed to handle all aspects of the rebuild of the POKT website. We are thrilled to present our comprehensive proposal for developing a state-of-the-art Software as a Service (SaaS) web portal that leverages the Gateway Kit as its robust backend. Our goal is to exceed expectations by incorporating essential features and considering some nice-to-have enhancements, resulting in a scalable portal that aligns perfectly with the needs of modern self-service SaaS platforms. We are committed to delivering an agile development process with active involvement from PNF and the Pocket community.

#### POKT POP- Gateway SaaS Kit

##### Detailed Modules Overview

###### 1. Project Website & Documentation
- **A. Public-Facing Website Development**
  - **Framework**: Utilize React.js for a responsive, dynamic project website.
- **B. Comprehensive Documentation**
  - **Tool**: Employ Docusaurus or similar for user-friendly documentation.
  - **Content**: Include thorough API docs and user manuals.

###### 2. User Access Module
- **A. User Authentication System**
  - **Authentication**: Implement OAuth2.0 or JWT for secure login.
  - **User Management**: Full CRUD operations for user profiles.
- **B. App/Endpoint Management System**
  - **App Settings**: Intuitive UI for configuration settings.
  - **API Key Management**: Robust system for key generation and security.
  - **Usage Reporting**: Detailed analytics and log dashboard for monitoring.

###### 3. Drop-in Payment Module
- **A. User-Payment Plan Setup**
  - **Payment Integration**: Pay as you go crypto payments in multiple tokens.
  - **Subscription Tiers**: Multiple tiers to cater to different user needs.
- **B. Invoicing & Reporting**
  - **Usage Notifications**: Automated alerts for usage and billing.

###### 4. Gateway Admin Module - Frontend
- **A. Gateway Health & Monitoring**
  - **Monitoring**: Real-time tracking and management of app stakes, utilizing Gateway Kit Prometheus metrics.
  - **Visualization**: Dynamic, visual representation of stats and health indicators.
- **B. User Access & Monitoring**
  - **Admin Panel**: Comprehensive user access management interface.
  - **Audit Trails**: Detailed logging and auditing for security and compliance.

###### 5. Gateway Proxy/Backend Setup
- **A. Request Relaying via Gateway Kit**
  - **Load Balancing**: Implement effective load distribution and routing.
- **B. Backend Tasks**
  - **Data Processing**: Efficient handling and processing of backend data.
  - **Caching Setup**: Implement caching for enhanced performance and speed.


#### Stack Details

##### Frontend
- **Framework**: Next.js
  - Utilizes React.js, enabling server-side rendering and static site generation.
  - Improved SEO, performance, easy routing, and Node.js integration.

##### Backend
- **Framework**: NestJS with Prisma ORM
  - NestJS offers modular architecture, maintainable and scalable code.
  - TypeScript support for reliability and maintainability.
  - Prisma ORM integrated for strong typing, model validation, and efficient database management.
  - Simplified database operations with an easy-to-use query builder.

- **Database**: PostgreSQL and Redis
  - Advanced SQL database with strong consistency and reliability for multi-tenancy user and application data.
  - Ideal for scalable applications and large datasets.
  - Redis offers low latency writes necessary for collecting usage stats on the reverse proxy

- **Reverse Proxy**: Golang
  - Interfaces with the gateway kit to offer the reverse proxy.
  - Performs authorization via API keys created by management system.
  - Tracks usage for billing purposes.


##### TEAM
###### [Raid Guild](https://www.raidguild.org/portfolio)
We are a selected Raiding Party custom built to tackle this unique POP. Raid Guild is a service DAO founded in late 2020 to provide clients access to a network of technical and creative Web3 builders. Our organization is flat and true to the ideals of the Ethereum ecosystem.

- **SAYONARA** - Lead Front End Dev
- **PLOR** - BackEnd Dev and Systems Engineer
- **BENEDICTVS** - Bis Dev
- **SASQUATCH** - Account/Project Management
---
#### Proposal from RaidGuild
    
##### Expected Deliverables
- **Design**
    - Wireframes for the user portal
    - Shared via figma for open use by community
- **Portal**
    - User management
    - Endpoint management
    - Usage statistics and Rate limits
    - Billing
- **Documentation**
    - Gateway usage information
    - Open source dev docs
- **Reverse Proxy**
    - Routes to gateway kit
    - Tracks per endpoint usage
    - Rate limiting


##### **Milestones**
---
###### Sprint 1: 
> - Design assets produced and reviewed
> - Backend components scaffolding and architecture design

###### Sprint 2: 
> - Portal initial development
>   - Landing page and login
> - Database initialization

###### Sprint 3: 
> - Portal user creation
> - Reverse proxy development

###### Sprint 4:
> - Portal endpoint creation
> - Documentation setup
> - Per endpoint usage tracking

###### Sprint 5:
> - Portal usage and rate limiting
> - Payment accounting and processing

###### Sprint 6:
> - Portal accounting reporting and payments
> - Finalize documentation
> - Final backend deploys and configuration

# Connection modes

Mosona Manager supports agentless and agent-based connections in active or passive direction.

## Agentless mode

Active (forward) connection: the Hub connects to the managed server. The server must be reachable from the Hub (public IP or VPN).

No agent installation is required on managed hosts.

## Agent mode

Optional lightweight agents report status or accept queries from the Hub.

### Active agent

Same as agentless: the Hub initiates the connection to the agent endpoint.

### Passive agent

Reverse connection: the agent connects outbound to the Hub. The Hub must be reachable from agents (public IP or tunnel).

## Choosing a mode

| Scenario | Suggested mode |
| --- | --- |
| Servers behind NAT, Hub has public IP | Passive agent |
| Servers with public SSH, no agent | Agentless |
| Rich metrics via agent API | Active agent |

## Example: passive agent env

```env
HUB_URL=https://hub.example.com
AGENT_TOKEN=your-registration-token
```

Refer to your deployment guide for token issuance and firewall rules.
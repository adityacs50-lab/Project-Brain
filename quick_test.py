import requests

BASE = 'http://localhost:8000'
WS = 'test-workspace-1'

# Get current rules
r = requests.get(f'{BASE}/rules/{WS}/rules').json()
pending = [x for x in r if x['status'] == 'pending']
print(f'Pending rules: {len(pending)}')

if len(pending) >= 3:
    # Approve Rule 1 (Refund)
    resp = requests.patch(
        f'{BASE}/rules/{pending[0]["id"]}/status',
        json={'status': 'active'}
    )
    print(f'Approve Rule 1: {resp.status_code}')

    # Edit & Approve Rule 2 (Bug Ticket)
    new_text = pending[1]['rule_text'] + ' (Edited)'
    resp = requests.patch(
        f'{BASE}/rules/{pending[1]["id"]}/status',
        json={'status': 'active', 'edited_text': new_text}
    )
    print(f'Edit & Approve Rule 2: {resp.status_code}')

    # Reject Rule 3 (Refund contradiction)
    resp = requests.patch(
        f'{BASE}/rules/{pending[2]["id"]}/status',
        json={'status': 'archived'}
    )
    print(f'Reject Rule 3: {resp.status_code}')

# Final state
r = requests.get(f'{BASE}/rules/{WS}/rules').json()
active = [x for x in r if x['status'] == 'active']
pending = [x for x in r if x['status'] == 'pending']
print(f'\nFinal: Active={len(active)}, Pending={len(pending)}')
print('Active rules:')
for x in active:
    print(f'  - {x["title"]}')

if len(active) == 2 and len(pending) == 0:
    print('\n✅ ALL TESTS PASSED!')
else:
    print('\n❌ TEST FAILED')

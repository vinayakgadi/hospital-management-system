import urllib.request
import json
import time

BASE = 'http://127.0.0.1:5000'

def test_endpoint(url, token=None, samples=3):
    r = urllib.request.Request(BASE + url)
    if token:
        r.add_header('Authorization', 'Bearer ' + token)
    
    times = []
    db_times = []
    queries = []
    
    for _ in range(samples):
        t0 = time.time()
        with urllib.request.urlopen(r) as res:
            res.read()
            t1 = time.time()
            resp_ms = res.headers.get('X-Response-Time-Ms')
            db_ms = res.headers.get('X-DB-Time-Ms')
            q_cnt = res.headers.get('X-DB-Queries')
            times.append((t1 - t0) * 1000)
            if db_ms is not None:
                db_times.append(float(db_ms))
            if q_cnt is not None:
                queries.append(int(q_cnt))
    
    avg_total = sum(times) / len(times)
    min_total = min(times)
    avg_db = sum(db_times) / len(db_times) if db_times else 0.0
    avg_q = sum(queries) / len(queries) if queries else 0
    return {
        "url": url,
        "avg_total_ms": avg_total,
        "min_total_ms": min_total,
        "avg_db_ms": avg_db,
        "queries": avg_q
    }

def run_benchmark():
    # Login
    r = urllib.request.Request(
        BASE + '/api/auth/login',
        data=json.dumps({'email': 'admin@healthpulse.com', 'password': 'admin123', 'role': 'admin'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(r) as res:
        token = json.loads(res.read().decode())['token']

    endpoints = [
        ('/patients', False),
        ('/patients?page=1&per_page=12', False),
        ('/api/doctors', False),
        ('/api/doctors?page=1&per_page=12', False),
        ('/api/appointments', False),
        ('/api/appointments?page=1&per_page=15', False),
        ('/api/medical-records?page=1&per_page=10', True),
        ('/api/prescriptions?page=1&per_page=10', True),
        ('/api/admin/dashboard/stats', False),
        ('/api/admin/dashboard/patient-trends?days=7', False),
        ('/api/admin/dashboard/appointment-stats', False),
        ('/api/admin/dashboard/activity?limit=8', False),
        ('/api/admin/dashboard/upcoming-appointments?limit=5', False),
    ]

    print("\n" + "=" * 80)
    print("HEALTHPULSE DATABASE & API PERFORMANCE BENCHMARK REPORT")
    print("=" * 80)
    print(f"{'Endpoint':<45} | {'Avg Latency':<12} | {'Server DB Time':<15} | {'Queries':<7}")
    print("-" * 80)

    results = []
    for ep, auth in endpoints:
        res = test_endpoint(ep, token if auth else None)
        results.append(res)
        print(f"{res['url']:<45} | {res['avg_total_ms']:8.1f} ms | {res['avg_db_ms']:10.1f} ms   | {res['queries']:5.0f} q")

    print("-" * 80)

if __name__ == '__main__':
    run_benchmark()

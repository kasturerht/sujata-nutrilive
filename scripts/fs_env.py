def get_gmail_creds():
    with open('.env', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    env = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env.get('GMAIL_USER'), env.get('GMAIL_APP_PASSWORD')

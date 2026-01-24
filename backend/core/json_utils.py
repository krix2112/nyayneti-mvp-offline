def sanitize_for_json(obj):
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]
    elif hasattr(obj, 'tolist'): # Handle numpy arrays/scalars
        return obj.tolist()
    elif hasattr(obj, '__dict__'):
        return sanitize_for_json(obj.__dict__)
    else:
        return obj

"""
============================================================
UTILS: TIMEZONE - Fuso horário de Brasília
============================================================
Fornece datetime com timezone de Brasília (UTC-3)
"""

from datetime import datetime, timezone, timedelta

# Timezone de Brasília (BRT = UTC-3)
BRASILIA_TZ = timezone(timedelta(hours=-3))


def now_brasilia() -> datetime:
    """
    Retorna datetime atual no fuso horário de Brasília.

    Returns:
        datetime: Datetime atual com timezone UTC-3

    Example:
        >>> now = now_brasilia()
        >>> print(now.strftime('%d/%m/%Y %H:%M:%S'))
        '09/11/2025 14:30:45'
    """
    return datetime.now(BRASILIA_TZ)


def format_brasilia(dt: datetime, formato: str = '%d/%m/%Y %H:%M:%S') -> str:
    """
    Formata datetime para string no formato brasileiro.

    Args:
        dt: Datetime para formatar (com ou sem timezone)
        formato: String de formato (padrão: 'dd/mm/aaaa hh:mm:ss')

    Returns:
        str: Data formatada

    Example:
        >>> dt = now_brasilia()
        >>> format_brasilia(dt)
        '09/11/2025 14:30:45'
    """
    if dt.tzinfo is None:
        # Se não tem timezone, assume UTC e converte para Brasília
        dt = dt.replace(tzinfo=timezone.utc).astimezone(BRASILIA_TZ)
    else:
        # Converte para Brasília
        dt = dt.astimezone(BRASILIA_TZ)

    return dt.strftime(formato)
